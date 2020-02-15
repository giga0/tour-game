<template>
  <div id="app">
    <h1 class="heading">Tour Game</h1>
    <div class="global-wrapper">
      <div class="game-wrapper">
        <div class="board">
          <template
            v-for="(array, vIndex) in board">
            <box
              v-for="(item, hIndex) in array"
              :key="`v${vIndex}_h${hIndex}`"
              :item="item"
              :start="start"
              @click="boxClicked(item, [vIndex, hIndex])"/>
          </template>
        </div>
        <div class="stats">
        </div>
      </div>
      <div class="score-wrapper">
      </div>
    </div>
  </div>
</template>

<script>
/* eslint-disable */
import Box from './components/Box'

export default {
  name: 'App',

  components: {
    Box
  },
  
  data () {
    return {
      board: null,
      start: true
    }
  },

  created () {
    this.board = this.generateBoard(10)
  },

  methods: {
    generateBoard (size) {
      const board = []
      // vertical board setup
      for (let v = 0; v < size; v++) {
        board.push([])
        // horizontal board setup
        for (let h = 0; h < size; h++) {
          board[v].push({
            stepped_on: false,
            can_be_stepped: false,
            future_step: false
          })
        }
      }
      return board
    },
    boxClicked (box, position) {
      console.log(box, position)
      this.start = false
      box.stepped_on = true
    }
  }
}
</script>

<style lang="scss">
@import "./assets/style/main";

#app {
  font-family: sans-serif;
  color: $font-color;
  width: 100%;
  .heading {
    color: $black;
    @include fontSizeRem(20, 40);
    font-weight: 900;
    text-align: center;
    padding: 1rem;
    @include breakpoint(desktop) {
      padding: 2rem;
    }
  }
  .global-wrapper {
    display: flex;
    flex-direction: column;
    padding: 1rem;
    @include breakpoint(desktop) {
      flex-direction: row;
      padding: 4rem;
    }
  }
  .game-wrapper {
    flex: 1 0 55%;
  }
  .score-wrapper {
    flex: 1 0 45%;
  }
  .board {
    display: flex;
    flex-wrap: wrap;
  }
}
</style>
