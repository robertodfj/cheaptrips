import { createError } from 'h3'
import { useRuntimeConfig } from '#imports'
import type { Flight } from '~/types/flight'
import type { FlightSearchProvider, FlightSearchQuery } from '../types/flight-search'

type SkyscannerDate = {
  year?: number
  month?: number
  day?: number
}

type SkyscannerPlace = {
  iata?: string
  entityId?: string
}

type SkyscannerQueryLeg = {
  originPlaceId: SkyscannerPlace
  destinationPlaceId: SkyscannerPlace
  date: SkyscannerDate
}

type SkyscannerSearchQuery = {
  market: string
  locale: string
  currency: string
  queryLegs: SkyscannerQueryLeg[]
  adults: number
  cabinClass: 'CABIN_CLASS_ECONOMY'
  nearbyAirports?: boolean
  includeSustainabilityData?: boolean
}

type SkyscannerTokenResponse = {
  sessionToken?: string
}

type SkyscannerSearchResponse = {
  sessionToken?: string
  status?: string
  content?: {
    results?: {
      itineraries?: SkyscannerItinerary[]
      stats?: {
        minPrice?: {
          amount?: number | string
          currency?: string
        }
      }
    }
  }
}

type SkyscannerItinerary = {
  id?: string
  price?: {
    amount?: number | string
    currency?: string
    total?: number | string
  }
  deepLink?: string
  pricingOptions?: Array<{
    deepLink?: string
    transferType?: string
    agentIds?: string[]
    items?: Array<{
      deepLink?: string
      agentId?: string
    }>
    price?: {
      amount?: number | string
      currency?: string
      total?: number | string
    }
  }>
  legs?: Array<{
    departureDate?: string
    arrivalDate?: string
    segments?: Array<{
      departure?: {
        dateTime?: string
        iata?: string
      }
      arrival?: {
        dateTime?: string
        iata?: string
      }
      marketingCarrier?: {
        name?: string
        iata?: string
      }
      carrier?: {
        name?: string
        iata?: string
      }
    }>
  }>
}

function requireSkyscannerConfig() {
  const config = useRuntimeConfig()

  if (!config.skyscannerApiKey) {
    throw createError({
      statusCode: 503,
      statusMessage: 'Skyscanner API key is not configured'
    })
  }

  return config
}

function toDateParts(dateValue: string) {
  const [year, month, day] = dateValue.split('-').map((part) => Number.parseInt(part, 10))

  if (!Number.isFinite(year) || !Number.isFinite(month) || !Number.isFinite(day)) {
    return null
  }

  return { year, month, day }
}

function buildSearchQuery(query: FlightSearchQuery, config: ReturnType<typeof useRuntimeConfig>): SkyscannerSearchQuery {
  const departureDate = toDateParts(query.departureDate)

  if (!departureDate) {
    throw createError({
      statusCode: 400,
      statusMessage: 'departureDate must use YYYY-MM-DD format'
    })
  }

  const queryLegs: SkyscannerQueryLeg[] = [
    {
      originPlaceId: { iata: query.origin },
      destinationPlaceId: { iata: query.destination },
      date: departureDate
    }
  ]

  if (query.returnDate) {
    const returnDate = toDateParts(query.returnDate)

    if (returnDate) {
      queryLegs.push({
        originPlaceId: { iata: query.destination },
        destinationPlaceId: { iata: query.origin },
        date: returnDate
      })
    }
  }

  return {
    market: config.skyscannerMarket || 'ES',
    locale: config.skyscannerLocale || 'es-ES',
    currency: query.currency || 'EUR',
    queryLegs,
    adults: query.adults || 1,
    cabinClass: 'CABIN_CLASS_ECONOMY',
    nearbyAirports: true,
    includeSustainabilityData: false
  }
}

function buildBookingUrl(itinerary: SkyscannerItinerary, query: FlightSearchQuery) {
  const bookingUrl = itinerary.pricingOptions?.[0]?.items?.[0]?.deepLink || itinerary.pricingOptions?.[0]?.deepLink || itinerary.deepLink

  if (bookingUrl) {
    return bookingUrl
  }

  const url = new URL('https://www.skyscanner.net/transport/flights')
  url.searchParams.set('adults', String(query.adults || 1))
  url.searchParams.set('cabinclass', 'economy')
  url.searchParams.set('currency', query.currency || 'EUR')

  return url.toString()
}

function pickPrice(itinerary: SkyscannerItinerary, fallbackCurrency: string) {
  const price = itinerary.price || itinerary.pricingOptions?.[0]?.price
  const amount = Number(price?.amount ?? price?.total ?? 0)

  return {
    amount: Number.isFinite(amount) ? amount : 0,
    currency: price?.currency || fallbackCurrency
  }
}

function pickAirline(itinerary: SkyscannerItinerary) {
  const firstSegment = itinerary.legs?.[0]?.segments?.[0]

  return (
    firstSegment?.marketingCarrier?.name ||
    firstSegment?.carrier?.name ||
    firstSegment?.marketingCarrier?.iata ||
    firstSegment?.carrier?.iata ||
    'Skyscanner'
  )
}

function mapItineraryToFlight(itinerary: SkyscannerItinerary, query: FlightSearchQuery): Flight {
  const firstLeg = itinerary.legs?.[0]
  const lastLeg = itinerary.legs?.at(-1)
  const firstSegment = firstLeg?.segments?.[0]
  const lastSegment = lastLeg?.segments?.at(-1)
  const price = pickPrice(itinerary, query.currency || 'EUR')

  return {
    id: itinerary.id || `${query.origin}-${query.destination}-${query.departureDate}-${query.returnDate || 'oneway'}`,
    origin: firstSegment?.departure?.iata || query.origin,
    destination: lastSegment?.arrival?.iata || query.destination,
    departureDate: firstSegment?.departure?.dateTime || firstLeg?.departureDate || query.departureDate,
    returnDate: lastSegment?.departure?.dateTime || lastLeg?.departureDate || query.returnDate || '',
    airline: pickAirline(itinerary),
    price: price.amount,
    currency: price.currency,
    bookingUrl: buildBookingUrl(itinerary, query),
    image: ''
  }
}

async function createSearchSession(config: ReturnType<typeof useRuntimeConfig>, query: FlightSearchQuery) {
  const response = await $fetch<SkyscannerTokenResponse>(`${config.skyscannerApiBaseUrl}/flights/live/search/create`, {
    method: 'POST',
    headers: {
      'x-api-key': config.skyscannerApiKey,
      'Content-Type': 'application/json'
    },
    body: {
      query: buildSearchQuery(query, config)
    }
  })

  if (!response.sessionToken) {
    throw createError({
      statusCode: 502,
      statusMessage: 'Skyscanner search did not return a session token'
    })
  }

  return response.sessionToken
}

async function pollSearchSession(config: ReturnType<typeof useRuntimeConfig>, sessionToken: string) {
  return await $fetch<SkyscannerSearchResponse>(`${config.skyscannerApiBaseUrl}/flights/live/search/poll/${sessionToken}`, {
    method: 'POST',
    headers: {
      'x-api-key': config.skyscannerApiKey
    }
  })
}

function extractItineraries(response: SkyscannerSearchResponse) {
  return response.content?.results?.itineraries || []
}

export function createSkyscannerFlightSearchProvider(): FlightSearchProvider {
  return {
    async searchFlights(query) {
      const config = requireSkyscannerConfig()
      const sessionToken = await createSearchSession(config, query)
      const response = await pollSearchSession(config, sessionToken)
      const itineraries = extractItineraries(response)

      return itineraries.slice(0, query.limit || 10).map((itinerary) => mapItineraryToFlight(itinerary, query))
    }
  }
}