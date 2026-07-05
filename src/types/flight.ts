export interface Flight {
  id: string
  origin: string
  destination: string

  departureDate: string
  returnDate: string

  airline: string

  price: number
  currency: string

  bookingUrl: string

  image: string
}
