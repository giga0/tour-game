<template>
  <div
    class="box"
    :class="setClass"
    @click="$emit('click')">
    <svg
      id="step"
      enable-background="new 0 0 492.033 492.033"
      viewBox="0 0 492.033 492.033"
      xmlns="http://www.w3.org/2000/svg">
      <path d="m290.239 380.785c-3.025-1.353-6.574.003-7.927 3.027-.289.646-.461 1.338-.509 2.045l-3.824 56.419c-1.71 25.669 17.681 47.879 43.346 49.648 1.078.072 2.151.108 3.22.109 24.488-.039 44.77-19.023 46.427-43.455l1.8-26.584c.17-2.508-1.242-4.857-3.537-5.883zm68.76 66.982c-1.292 19.067-17.796 33.476-36.863 32.184s-33.476-17.796-32.184-36.863l3.242-47.836 67.324 30.1z"/>
      <path d="m261.917 230.898 24.812 116.866c.39 1.836 1.616 3.384 3.314 4.183l80.425 37.852c2.998 1.411 6.573.125 7.984-2.873.143-.303.26-.618.35-.941l25.042-89.662c.03-.111.059-.224.083-.337 9.595-44.067 10.7-81.63 3.284-111.646-6.311-25.544-18.871-45.235-36.321-56.944-21.426-14.376-48.688-15.2-67.921-2.081-1.958 1.164-14.021 8.73-24.826 24.461-10.552 15.361-21.943 41.838-16.294 80.738.023.128.046.257.068.384zm25.783-73.837c9.975-14.745 21.351-21.4 21.448-21.458.151-.086.3-.179.442-.278 12.67-8.727 34.471-11.481 54.613 2.036 34.343 23.044 44.559 79.861 28.036 155.9l-23.085 82.655-71.305-33.56-24.152-113.76c-3.998-27.818.713-51.885 14.008-71.535z"/>
      <path d="m207.048 265.198c-1.679-1.014-3.748-1.143-5.54-.346l-79.065 35.18c-2.297 1.022-3.713 3.367-3.548 5.876l1.752 26.588c1.616 24.468 21.915 43.499 46.436 43.536 1.039 0 2.082-.033 3.131-.1 25.681-1.691 45.129-23.879 43.438-49.56 0-.002 0-.004 0-.006l-3.718-56.426c-.129-1.957-1.207-3.728-2.886-4.742zm-13.874 87.034c-12.588 14.377-34.448 15.826-48.825 3.238-6.91-6.051-11.131-14.601-11.732-23.766l-1.477-22.413 67.382-29.978 3.152 47.841c.629 9.159-2.432 18.189-8.5 25.078z"/>
      <path d="m88.058 180.177 24.873 89.707c.885 3.193 4.192 5.064 7.385 4.179.323-.09.638-.206.941-.348l80.5-37.7c1.699-.796 2.929-2.341 3.322-4.176l25.031-116.82c.027-.128.05-.256.069-.384 5.722-38.89-5.62-65.388-16.142-80.769-10.776-15.752-22.826-23.34-24.781-24.507-19.206-13.158-46.47-12.383-67.924 1.953-17.472 11.676-30.068 31.344-36.428 56.876-7.472 30-6.438 67.567 3.074 111.652.02.112.048.225.08.337zm39.938-158.889c20.169-13.479 41.964-10.683 54.616-1.933.133.092.286.188.426.269.113.066 11.477 6.745 21.425 21.509 13.258 19.674 17.923 43.75 13.868 71.563l-24.366 113.714-71.368 33.422-22.929-82.7c-16.38-76.065-6.059-132.864 28.328-155.844z"/>
    </svg>
  </div>
</template>

<script>
export default {
  name: 'Box',

  props: {
    item: { type: Object },
    start: { type: Boolean }
  },

  computed: {
    setClass () {
      return this.start ? 'box--start' : (() => {
        if (this.item.isSet) {
          if (this.item.currentStatus.steppedOn) {
            return 'box--stepped-on'
          }
          if (this.item.currentStatus.canBeStepped) {
            return 'box--can-be-stepped'
          }
          if (this.item.currentStatus.futureStep) {
            return 'box--future-step'
          }
        }
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
  display: flex;
  justify-content: center;
  align-items: center;
  height: 3rem;
  outline: 1px solid $dark_grey;
  transition: background-color .2s ease-in-out;
  @include breakpoint(desktop) {
    height: 7.7rem;
  }
  svg {
    display: none;
    width: 60%;
    height: 60%;
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
      background-color: lighten($light_green, 15%);
      @include breakpoint(desktop) {
        cursor: pointer;
      }
    }
    svg {
      display: inline-block;
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
