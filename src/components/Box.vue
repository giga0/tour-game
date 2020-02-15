<template>
  <div
    class="box"
    :class="setClass"
    @click="$emit('click')">
  </div>
</template>

<script>
export default {
  name: 'Button',

  props: {
    item: { type: Object },
    start: { type: Boolean }
  },

  computed: {
    setClass () {
      return this.start ? 'box--start' : (() => {
        if (this.item.stepped_on) return 'box--stepped-on'
        if (this.item.can_be_stepped) return 'box--can-be-stepped'
        if (this.item.future_step) return 'box--future-step'
        return 'box--disabled'
      })()
    }
  }
}
</script>

<style lang="scss" scoped>
@import '../assets/style/settings/_module-settings';

.box {
  flex: 1 0 10%;
  height: 3rem;
  outline: 1px solid $darkgrey;
  transition: background-color .2s ease-in-out;
  @include breakpoint(desktop) {
    height: 10.12rem;
  }
  &--start {
    background-color: $light_gray;
    &:hover {
      background-color: lighten($light_gray, 15%);
      @include breakpoint(desktop) {
        cursor: pointer;
      }
    }
  }
  &--stepped-on {
    background-color: $dark_green;
    pointer-events: none;
  }
  &--can-be-stepped {
    background-color: $light_green;
    &:hover {
      background-color: lighten($light_green, 5%);
      @include breakpoint(desktop) {
        cursor: pointer;
      }
    }
  }
  &--future-step {
    background-color: $green;
    pointer-events: none;
  }
  &--disabled {
    background-color: $light_gray;
    pointer-events: none;
  }
}
</style>
