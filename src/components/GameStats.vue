<template>
  <div
    class="game-stats">
    <p>Stats</p>
    <span>Timer: {{ stats.timer }}s</span>
    <span>Left to click: {{ stats.leftToClick }}</span>
    <span>Lives: {{ stats.lives }}</span>
    <span>Level: {{ stats.level }}</span>
  </div>
</template>

<script>
export default {
  name: 'GameStats',

  props: {
    stats: { type: Object }
  }
}
</script>

<style lang="scss" scoped>
@import '../assets/style/settings/_module-settings';

.game-stats {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-top: 1rem;
  @include breakpoint(desktop) {
    margin-top: 2rem;
  }
  p {
    color: $red_pink;
    @include fontSizeRem(14, 22);
  }
  span {
    @include fontSizeRem(12, 20);
  }
}
</style>
