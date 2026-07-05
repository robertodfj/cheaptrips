import type { FlightSearchProvider } from '../types/flight-search'
import { createAmadeusFlightSearchProvider } from '../providers/amadeus'

const providers: Record<string, FlightSearchProvider> = {
  amadeus: createAmadeusFlightSearchProvider()
}

export function getFlightSearchProvider() {
  return providers.amadeus
}