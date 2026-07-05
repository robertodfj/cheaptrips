import type { Flight } from '~/types/flight'

export interface FlightSearchQuery {
  origin: string
  destination: string
  departureDate: string
  returnDate?: string
  adults?: number
  currency?: string
  limit?: number
}

export interface FlightSearchProvider {
  searchFlights(query: FlightSearchQuery): Promise<Flight[]>
}