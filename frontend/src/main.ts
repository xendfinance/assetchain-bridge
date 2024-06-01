import { createApp, Plugin } from 'vue'

import { createPinia } from 'pinia'
import { autoAnimatePlugin } from '@formkit/auto-animate/vue'
import VueAwesomePaginate from 'vue-awesome-paginate'

import 'vue-awesome-paginate/dist/style.css'

import App from '@/App.vue'
import '@/assets/index.css'
import '@/assets/fonts/Syne/stylesheet.css'
import '@/assets/fonts/WorkSans/stylesheet.css'

import router from '@/router'

import '@/gotbit-tools/vue/init'
import { routerPlugin, vId } from '@/gotbit-tools/vue/plugins'

import DialogComponents from '@/components/popups'

const app = createApp(App)

Object.keys(DialogComponents).forEach((name) => {
  app.component(name, (DialogComponents as any)[name])
})

const pinia = createPinia()
pinia.use(routerPlugin(router))

app.use(pinia)
app.use(router)
app.directive('id', vId)
app.use(autoAnimatePlugin)
app.use(VueAwesomePaginate as any)

app.mount('#app')
