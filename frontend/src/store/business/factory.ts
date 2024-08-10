import { computed } from "vue"
import { useFactory } from "../contracts/factory"

export const useFactoryRead = () => {
    const factory = useFactory()
  
    return {
    
      loading: computed(() => factory.loading),
    }
  }