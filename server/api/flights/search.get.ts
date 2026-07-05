import { createError, defineEventHandler, getQuery } from 'h3'
import { getFlightSearchProvider } from '../../services/flight-search'
import type { FlightSearchQuery } from '../../types/flight-search'

function toSingleString(value: unknown) {
  if (Array.isArray(value)) {
    const firstValue = value[0]

    return typeof firstValue === 'string' ? firstValue : undefined
  }

  return typeof value === 'string' ? value : undefined
}

function parsePositiveInteger(value: unknown, fallback: number) {
  const parsedValue = Number.parseInt(typeof value === 'string' ? value : '', 10)

  return Number.isFinite(parsedValue) && parsedValue > 0 ? parsedValue : fallback
}

export default defineEventHandler(async (event) => {
  const query = getQuery(event)

  const origin = toSingleString(query.origin)?.trim().toUpperCase()
  const destination = toSingleString(query.destination)?.trim().toUpperCase()
  const departureDate = toSingleString(query.departureDate)?.trim()
  const returnDate = toSingleString(query.returnDate)?.trim()
  const currency = (toSingleString(query.currency)?.trim().toUpperCase() || 'EUR')
  const adults = parsePositiveInteger(toSingleString(query.adults) || toSingleString(query.passengers), 1)
  const limit = parsePositiveInteger(toSingleString(query.limit), 10)

  if (!origin || !destination || !departureDate) {
    throw createError({
      statusCode: 400,
      statusMessage: 'origin, destination and departureDate are required'
    })
  }

  const flightSearchProvider = getFlightSearchProvider()
  const flights = await flightSearchProvider.searchFlights({
    origin,
    destination,
    departureDate,
    returnDate: returnDate || undefined,
    adults,
    currency,
    limit
  } satisfies FlightSearchQuery)

  return {
    provider: 'amadeus',
  }
})