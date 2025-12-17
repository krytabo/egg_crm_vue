import { inject } from 'vue'

export const CarouselSymbol = Symbol('UiCarousel')

export const useCarousel = () => inject(CarouselSymbol, null)
