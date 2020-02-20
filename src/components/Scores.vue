<template>
  <div class="scores">
    <h3>Top scores</h3>
    <table>
      <thead>
        <th
          v-for="(col, index) in headerColumns"
          :key="index">
          {{ col }}
        </th>
      </thead>
      <tbody>
        <template v-for="(level, id) in repackedScores">
          <score-row
            v-for="(playerScores, prop) in level"
            :key="`${id}-${prop}`"
            :playerScores="playerScores" />
        </template>
      </tbody>
    </table>
  </div>
</template>

<script>
import ScoreRow from './ScoreRow'

export default {
  name: 'Scores',

  components: {
    ScoreRow
  },

  props: {
    scores: { type: Array }
  },

  data () {
    return {
      headerColumns: ['Level', 'Time', 'Player', 'Times completed']
    }
  },

  computed: {
    repackedScores () {
      return this.repackScoresByLevelPerPlayer(this.repackScoresByLevel()).reverse()
    }
  },

  methods: {
    repackScoresByLevel () {
      const scoresByLevel = {}

      // loop through scores and group them by level
      for (let score of this.scores) {
        const level = score.level
        if (!scoresByLevel[level]) scoresByLevel[level] = []
        scoresByLevel[level].push(score)
        // sort scores by time
        scoresByLevel[level].sort(function(a, b) { 
          return a.time - b.time
        })
      }

      return scoresByLevel
    },
    repackScoresByLevelPerPlayer (scoresByLevel) {
      const scoresByLevelPerPlayer = []

      // loop through levels and scores grouped within levels
      for (let level in scoresByLevel) {
        for (let score of scoresByLevel[level]) {
          const testProp = `id_${score.player.id}[${score.player.name}]`
          if (!scoresByLevelPerPlayer[level]) scoresByLevelPerPlayer[level] = {}
          // group them additionaly per player
          if (!scoresByLevelPerPlayer[level][testProp]) scoresByLevelPerPlayer[level][testProp] = []
          scoresByLevelPerPlayer[level][testProp].push(score)
        }
      }

      // return scores array without empty values
      return scoresByLevelPerPlayer.filter(item => item)
    }
  }
}
</script>

<style lang="scss" scoped>
@import '../assets/style/settings/_module-settings';

.scores {
  h3 {
    color: $red_pink;
    @include fontSizeRem(18, 30);
    font-weight: 700;
    border-bottom: 1px solid $dark_grey;
    padding-bottom: .5rem;
    margin-bottom: .5rem;
    @include breakpoint(desktop) {
      padding-bottom: 2.6rem;
      margin-bottom: 1rem;
    }
  }
  table {
    thead {
      display: table;
      width: 100%;
      table-layout: fixed;
    }
    tbody {
      display: block;
      height: 18rem;
      overflow-y: auto;
      border: 1px solid $light_gray;
      border-radius: 5px;
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
        height: 40rem;
        &::-webkit-scrollbar {
          width: .5rem;
        }
        &::-webkit-scrollbar-thumb {
          width: .5rem;
        }
      }
    }
    th {
      @include fontSizeRem(12, 20);
      font-weight: 700;
      text-align: center;
      width: 25%;
      padding-bottom: .5rem;
      border-right: 1px solid $light_gray;
      border-left: 1px solid $light_gray;
      cursor: default;
      @include breakpoint(desktop) {
        padding-bottom: 1rem;
      }
    }
  }
}
</style>
