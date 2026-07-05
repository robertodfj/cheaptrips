import { createError } from 'h3'
import { useRuntimeConfig } from '#imports'
import type { Flight } from '~/types/flight'
import type { FlightSearchProvider, FlightSearchQuery } from '../types/flight-search'

interface AmadeusTokenResponse {
  access_token: string
  expires_in: number
  token_type: string
}

interface AmadeusFlightOfferResponse {
  data: AmadeusFlightOffer[]
}

interface AmadeusFlightOffer {
  id: string
  itineraries: Array<{
    segments: Array<{
      departure: { iataCode?: string; at?: string }
      arrival: { iataCode?: string; at?: string }
      carrierCode?: string
    }>
  }>
  price: {
    total: string
    currency: string
  }
  validatingAirlineCodes?: string[]
}

type CachedToken = {
  value: string
  expiresAt: number
}

let cachedToken: CachedToken | null = null

function requireAmadeusConfig() {
  const config = useRuntimeConfig()

  if (!config.amadeusClientId || !config.amadeusClientSecret) {
    throw createError({
      statusCode: 503,
      statusMessage: 'Amadeus credentials are not configured'
    })
  }

  return config
}

async function getAmadeusToken() {
  const config = requireAmadeusConfig()

  if (cachedToken && cachedToken.expiresAt > Date.now()) {
    return cachedToken.value
  }

  const tokenResponse = await $fetch<AmadeusTokenResponse>(
    `${config.amadeusApiBaseUrl}/v1/security/oauth2/token`,
    {
      method: 'POST',
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: config.amadeusClientId,
        client_secret: config.amadeusClientSecret
      }).toString(),
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    }
  )

  cachedToken = {
    value: tokenResponse.access_token,
    expiresAt: Date.now() + Math.max(tokenResponse.expires_in - 60, 60) * 1000
  }

  return tokenResponse.access_token
}

function buildBookingUrl(query: FlightSearchQuery) {
  const url = new URL('https://www.google.com/travel/flights')

  url.searchParams.set('q', `${query.origin} to ${query.destination}`)
  url.searchParams.set('curr', query.currency || 'EUR')
  url.searchParams.set('adults', String(query.adults || 1))

  return url.toString()
}

function mapFlightOfferToFlight(offer: AmadeusFlightOffer, query: FlightSearchQuery): Flight {
  const outboundSegment = offer.itineraries[0]?.segments[0]
  const returnSegment = offer.itineraries[1]?.segments[0]

  return {
    id: offer.id,
    origin: outboundSegment?.departure.iataCode || query.origin,
    destination: outboundSegment?.arrival.iataCode || query.destination,
    departureDate: outboundSegment?.departure.at || query.departureDate,
    returnDate: returnSegment?.departure.at || query.returnDate || '',
    airline: offer.validatingAirlineCodes?.[0] || outboundSegment?.carrierCode || 'Amadeus',
    price: Number(offer.price.total),
    currency: offer.price.currency,
    bookingUrl: buildBookingUrl(query),
    image: ''
  }
}

export function createAmadeusFlightSearchProvider(): FlightSearchProvider {
  return {
    async searchFlights(query) {
      const config = requireAmadeusConfig()
      const accessToken = await getAmadeusToken()

      const searchUrl = new URL(`${config.amadeusApiBaseUrl}/v2/shopping/flight-offers`)

      searchUrl.searchParams.set('originLocationCode', query.origin)
      searchUrl.searchParams.set('destinationLocationCode', query.destination)
      searchUrl.searchParams.set('departureDate', query.departureDate)
      searchUrl.searchParams.set('adults', String(query.adults || 1))
      searchUrl.searchParams.set('currencyCode', query.currency || 'EUR')
      searchUrl.searchParams.set('max', String(query.limit || 10))

      if (query.returnDate) {
        searchUrl.searchParams.set('returnDate', query.returnDate)
      }

      const response = await $fetch<AmadeusFlightOfferResponse>(searchUrl.toString(), {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      })

      return response.data.map((offer) => mapFlightOfferToFlight(offer, query))
    }
  }
}