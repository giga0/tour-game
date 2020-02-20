<template functional>
  <tr>
    <td class="level">
      {{ props.playerScores[0].level }}
    </td>
    <td
      class="time"
      :class="{ 'time--more': props.playerScores.length > 1 }">
      {{ props.playerScores[0].time }} seconds
      <div class="times-list">
        <ul>
          <li
            v-for="(score, index) in props.playerScores"
            :key="index">
            <template v-if="index === 0">
              <span>Other times:</span>
            </template>
            <template v-else>
              {{ score.time }} seconds
            </template>
          </li>
        </ul>
      </div>
    </td>
    <td class="player-name">
      {{ props.playerScores[0].player.name }}
    </td>
    <td class="times-completed">
      {{ props.playerScores.length }}
    </td>
  </tr>
</template>

<script>
export default {
  name: 'ScoreRow',

  props: {
    playerScores: { type: Array }
  }
}
</script>

<style lang="scss" scoped>
@import '../assets/style/settings/_module-settings';

tr {
  display: table;
  width: 100%;
  table-layout: fixed;
}
td {
  @include fontSizeRem(12, 20);
  text-align: center;
  position: relative;
  width: 25%;
  padding: .5rem 0;
  pointer-events: none;
  @include breakpoint(desktop) {
    padding: 1rem 0;
  }
  &.time--more {
    color: $blue;
    pointer-events: initial;
    cursor: pointer;
    &.is-visible {
      .times-list {
        display: block;
      }
    }
  }
}
.times-list {
  color: $white;
  font-style: italic;
  display: none;
  overflow: hidden;
  width: auto;
  position: absolute;
  top: 1.9rem;
  left: -1.2rem;
  border-radius: 5px;
  box-shadow: 0 4px 8px 0 rgba(36, 41, 56, 0.1);
  background-color: $white;
  cursor: default;
  @include breakpoint(desktop) {
    top: 3.5rem;
    left: 1rem;
  }
  ul {
    overflow-y: auto;
    z-index: 1;
    position: relative;
    background-color: $dark_grey;
    max-height: 15rem;
    padding: 1rem 1.5rem;
    &::-webkit-scrollbar {
      width: .3rem;
      background-color: $white;
    }
    &::-webkit-scrollbar-thumb {
      width: .3rem;
      border-radius: 2px;
      background-color: #e8e8e8;
    }
    @include breakpoint(desktop) {
      max-height: 25rem;
      &::-webkit-scrollbar {
        width: .5rem;
      }
      &::-webkit-scrollbar-thumb {
        width: .5rem;
      }
    }
    li {
      @include fontSizeRem(12, 20);
      text-align: center;
      white-space: nowrap;
      margin-bottom: .9rem;
      &:last-child {
        margin-bottom: 0;
      }
      @include breakpoint(desktop) {
        margin-bottom: 1.9rem;
      }
      span {
        color: aqua;
      }
    }
  }
}
</style>
