<template functional>
  <button
    :style="{ backgroundColor: props.color }"
    :disabled="props.disabled"
    @click="listeners.click">
    <slot />
  </button>
</template>

<script>
export default {
  name: 'Button',
  
  props: {
    color: { type: String },
    disabled: { type: Boolean }
  }
}
</script>

<style lang="scss" scoped>
@import '../assets/style/settings/_module-settings';

button {
  @include fontSizeRem(12, 18);
  color: $white;
  background-color: $blue;
  padding: .8rem;
  border-radius: 5px;
  &:disabled {
    cursor: not-allowed;
    background-color: $dark_grey;
  }
  @include breakpoint(desktop) {
    padding: 1rem;
    &:not(:disabled):hover {
      box-shadow: 0 3px 6px 0 rgba(0, 0, 0, .3);
    }
  }
}
</style>
