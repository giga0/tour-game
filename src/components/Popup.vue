<template>
  <div class="popup-wrapper">
    <div class="overlay"></div>
    <div class="popup">
      <slot name="header" />
      <slot />
      <div class="buttons">
        <btn
          v-if="buttons.reject.isVisible"
          color="#f33558"
          @click="$emit('reject')">
          {{ buttons.reject.text }}
        </btn>
        <btn
          v-if="buttons.confirm.isVisible"
          color="#298c29"
          @click="$emit('confirm')">
          {{ buttons.confirm.text }}
        </btn>
      </div>
    </div>
  </div>
</template>

<script>
import Btn from './Button'

export default {
  name: 'Popup',

  components: {
    Btn
  },

  props: {
    buttons: { type: Object }
  }
}
</script>

<style lang="scss" scoped>
@import '../assets/style/settings/_module-settings';

.overlay {
  z-index: 9;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, .3);
}
.popup {
  z-index: 10;
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 85%;
  padding: 2rem;
  background-color: $light_blue;
  border-radius: 5px;
  @include breakpoint(desktop) {
    width: auto;
    padding: 4rem;
  }
  .buttons {
    display: flex;
    justify-content: space-around;
  }
}
</style>
