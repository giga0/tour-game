<template>
  <div
    v-if="items.length"
    class="dropdown">
    <div
      class="wrapper"
      @click="onClick">
      <button class="selected">
        <span>{{ selected.value }}</span>
        <div class="triangle"></div>
      </button>
      <div
        ref="list"
        class="list">
        <ul>
          <li
            v-for="(item, index) in items"
            :key="index"
            @click="selectLevel(item)">
            {{ item.value }}
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Dropdown',

  props: {
    items: { type: Array }
  },

  data () {
    return {
      selected: null,
      listIsVisible: false
    }
  },

  created () {
    this.selected = this.items[0]
    this.$emit('selected', this.selected)
  },

  methods: {
    onClick () {
      this.$refs.list.classList.toggle('is-visible')
    },
    selectLevel (item) {
      this.selected = item
      this.$emit('selected', this.selected)
    }
  }
}
</script>

<style lang="scss" scoped>
@import '../assets/style/settings/_module-settings';

.dropdown {
  .wrapper {
    position: relative;
    width: 10.8rem;
    margin: 0 auto;
    @include breakpoint(desktop) {
      width: 18.3rem;
    }
  }
  .selected {
    display: inline-flex;
    justify-content: space-between;
    align-items: center;
    border-radius: 6px;
    background-color: rgba(36, 41, 55, .1);
    width: 10.8rem;
    padding: .3rem 1rem;
    overflow: hidden;
    @include breakpoint(desktop) {
      width: 18.3rem;
      transition: all .25s ease;
      &:hover {
        background-color: rgba(36, 41, 55, .3);
      }
    }
    .triangle {
      display: inline-block;
      width: 0;
      height: 0;
      border-style: solid;
      border-width: .4rem .4rem 0 .4rem;
      border-color: $black transparent transparent transparent;
      @include breakpoint(desktop) {
        border-width: .6rem .6rem 0 .6rem;
      }
    }
    span {
      color: $font_color;
      @include fontSizeRem(12, 18);
      line-height: 1.8;
      display: inline-block;
      width: 100%;
      margin-right: .8rem;
      white-space: nowrap;
      overflow: hidden;
    }
  }
  .list {
    visibility: hidden;
    opacity: 0;
    overflow: hidden;
    width: 10.8rem;
    position: absolute;
    bottom: -.5rem;
    border-radius: 9px;
    box-shadow: 0 4px 8px 0 rgba(36, 41, 56, 0.1);
    border: 1px solid $dark_grey;
    background-color: $white;
    transition: all .25s ease-in-out;
    @include breakpoint(desktop) {
      width: 18.3rem;
    }
    &.is-visible {
      visibility: visible;
      opacity: 1;
    }
    ul {
      overflow-y: auto;
      z-index: 1;
      position: relative;
      background-color: $white;
      max-height: 15rem;
      padding: 1rem 1.5rem;
      @include breakpoint(desktop) {
        max-height: 25rem;
      }
      &::-webkit-scrollbar {
        width: .4rem;
        background-color: $white;
      }
      &::-webkit-scrollbar-thumb {
        width: .4rem;
        border-radius: 2px;
        background-color: #e8e8e8;
      }
      li {
        @include fontSizeRem(12, 18);
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1.5rem;
        cursor: pointer;
        &:last-child {
          margin-bottom: 0;
        }
      }
    }
  }
}
</style>
