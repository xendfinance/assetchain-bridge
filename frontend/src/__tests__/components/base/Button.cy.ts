import { mount } from 'cypress/vue'
// import BaseButton from '@/components/base/Button.vue'

// describe('BaseButton component', () => {
//   describe('provide correct props', () => {
//     it('should be basic button', () => {
//       const button = mount(BaseButton, { slots: { default: () => 'Basic button' } })
//       button.get('button').should('be.visible')
//       button.get('button').should('not.have.attr', 'disabled')
//     })
//     it('should be disable', () => {
//       const button = mount(BaseButton, {
//         props: { disabled: true },
//         slots: { default: () => 'Disabled button' },
//       })
//       button.get('button').should('be.visible')
//       button.get('button').should('have.attr', 'disabled')
//     })
//     it('should be loading', () => {
//       const button = mount(BaseButton, {
//         props: { loading: true },
//         slots: { default: () => 'Loading button' },
//       })
//       button.get('button').should('be.visible')
//       button.get('button').should('have.attr', 'disabled')
//       button.get('.opacity-0').should('have.text', 'Loading button')
//     })
//   })
//   describe('should have contend inside', () => {
//     it('should render text', () => {
//       const text = 'Hello my friend'
//       const button = mount(BaseButton, { slots: { default: () => text } })
//       button.get('button').should('have.text', text)
//     })
//   })
//   describe('should emit event on button `click` when not disabled or loaded', () => {
//     it('should emit event in basic', () => {
//       const onClickSpy = cy.spy().as('click')
//       const button = mount(BaseButton, {
//         props: { onClick: onClickSpy },
//         slots: { default: () => 'Press me' },
//       })

//       button.get('button').click()
//       cy.get('@click').should('have.been.calledOnce')
//     })
//     it('should not emit event disabled mode', () => {
//       const onClickSpy = cy.spy().as('click')
//       const button = mount(BaseButton, {
//         props: { disabled: true, onClick: onClickSpy },
//         slots: { default: () => 'Press me' },
//       })

//       button.get('button').click({ force: true })
//       cy.get('@click').should('not.have.been.called')
//     })

//     it('should not emit event loaded mode', () => {
//       const onClickSpy = cy.spy().as('click')
//       const button = mount(BaseButton, {
//         props: { loading: true, onClick: onClickSpy },
//         slots: { default: () => 'Press me' },
//       })

//       button.get('button').click({ force: true })
//       cy.get('@click').should('not.have.been.called')
//     })
//   })
// })
