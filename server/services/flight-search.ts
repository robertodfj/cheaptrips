import type { FlightSearchProvider } from '../types/flight-search'
import { createSkyscannerFlightSearchProvider } from '../providers/skyscanner'

const providers: Record<string, FlightSearchProvider> = {
  skyscanner: createSkyscannerFlightSearchProvider()
}

export function getFlightSearchProvider(): FlightSearchProvider {
  return providers.skyscanner
}