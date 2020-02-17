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
        <game-stats :stats="stats" />
      </div>
      <div class="score-wrapper">
      </div>
    </div>
    <transition name="fade">
      <popup
        v-if="levelStatus.finished"
        :buttons="{
          reject: { text: 'No', is_visible: true },
          confirm: { text: 'Yes', is_visible: true }
        }"
        @reject="resetLevelStatus"
        @confirm="continuePlaying">
        <template v-slot:header>
          <h4 :class="popupHeaderClass">{{ popupHeader }}</h4>
        </template>
        <p>{{ popupText }}</p>
        <div
          v-if="levelStatus.failed && stats.lives"
          class="select-level">
          <span>Choose level:</span>
          <dropdown
            :level="stats.level"
            @levelSelected="selectedLevel = $event" />
        </div>
      </popup>
    </transition>
  </div>
</template>

<script>
/* eslint-disable */
import { getPossibleSteps, calculateTour } from './helpers/tourCalculationFunctions'

import Box from './components/Box'
import GameStats from './components/GameStats'
import Popup from './components/Popup'
import Dropdown from './components/Dropdown'

const cloneDeep = require('lodash.clonedeep')

export default {
  name: 'App',

  components: {
    Box,
    GameStats,
    Popup,
    Dropdown
  },
  
  data () {
    return {
      board: null,
      start: true,
      cachedSteps: [],
      levelStatus: {
        finished: false,
        completed: false,
        failed: false
      },
      stats: {
        timer: 0,
        leftToClick: 0,
        lives: 3,
        level: 5
      },
      selectedLevel: null
    }
  },

  computed: {
    popupHeader () {
      let header = ''
      if (this.levelStatus.finished) {
        if (this.levelStatus.completed) header = `You have completed level: ${this.stats.level}`
        if (this.levelStatus.failed) {
          if (this.stats.lives) header = `You failed to complete the level: ${this.stats.level}`
          else header = 'End game'
        }
      }
      return header
    },
    popupHeaderClass () {
      let styleClass = ''
      if (this.levelStatus.finished) {
        if (this.levelStatus.completed) styleClass = 'success'
        if (this.levelStatus.failed) styleClass = 'fail'
      }
      return styleClass
    },
    popupText () {
      let text = ''
      if (this.levelStatus.finished) {
        if (this.levelStatus.completed) text = 'Do you want to play next level?'
        if (this.levelStatus.failed) {
          if (this.stats.lives) text = 'Do you want to try again?'
          else text = 'You have lost this game. Do you want to play again?'
        }
      }
      return text
    }
  },

  created () {
    this.board = this.generateBoard(5)
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
            is_set: false,
            currentStatus: {
              stepped_on: false,
              can_be_stepped: false,
              future_step: false
            }
          })
        }
      }
      return board
    },
    boxClicked (box, position) {
      if (this.start) this.startLevel(box, position)

      // you stepped on the box
      box.currentStatus.stepped_on = true
      this.stats.leftToClick--

      // if there is no more boxes left to click
      // do what needs to be done and exit function
      if (!this.stats.leftToClick) {
        this.levelCompleted()
        return
      }

      this.revertCachedStepsState()
      this.detectPossibleStepsForNextMove(position)

      // if there is no steps to go, player failed
      if (!this.cachedSteps.length) this.levelFailed()
    },
    startLevel (box, position) {
      this.start = false
      box.is_set = true
      this.stats.leftToClick = this.stats.level + 1
      this.generateStepsBasedOnLevel(this.stats.level, position)
      this.startTimer()
    },
    generateStepsBasedOnLevel (level, boxPosition) {
      let boxPositionClone = cloneDeep(boxPosition)
      const tour = calculateTour(this.board.length, boxPosition)
      tour.shift()
      // loop through levels and generate steps accordingly
      for (let i = 0; i < level; i++) {
        for (let step of tour) {
          const boardItem = this.board[step[0]][step[1]]
          if (boardItem.is_set) continue
          boardItem.is_set = true
          boardItem.currentStatus.future_step = true
          boxPositionClone = [step[0], step[1]]
          break
        }
      }
    },
    startTimer () {
      const timer = () => {
        this.stats.timer++
        if (this.levelStatus.finished) clearInterval(interval)
      }
      const interval = setInterval(timer, 1000)
    },
    revertCachedStepsState () {
      for (let item of this.cachedSteps) {
        if (item.currentStatus.stepped_on) continue
        item.currentStatus.future_step = true
        item.currentStatus.can_be_stepped = false
      }
      this.cachedSteps = []
    },
    detectPossibleStepsForNextMove (position) {
      const possibleSteps = getPossibleSteps(this.board, position)
      for (let step of possibleSteps) {
        const boardItem = this.board[step[0]][step[1]]
        if (!boardItem.currentStatus.future_step) continue
        boardItem.currentStatus.future_step = false
        boardItem.currentStatus.can_be_stepped = true
        this.cachedSteps.push(boardItem)
      }
    },
    levelCompleted () {
      this.levelStatus.finished = true
      this.levelStatus.completed = true
    },
    levelFailed () {
      const livesLeft = this.stats.lives - this.stats.leftToClick
      this.stats.lives = livesLeft <= 0 ? 0 : livesLeft
      this.levelStatus.finished = true
      this.levelStatus.failed = true
    },
    resetLevelStatus () {
      this.levelStatus.finished = false
      this.levelStatus.completed = false
      this.levelStatus.failed = false
    },
    continuePlaying () {
      if (this.levelStatus.completed) this.playNextLevel()
      if (this.levelStatus.failed) {
        if (this.stats.lives) this.playSelectedLevel()
        else this.playFromBeginning()
        this.stats.leftToClick = 0
      }
      this.stats.timer = 0
      this.start = true
      this.board = this.generateBoard(5)
      this.resetLevelStatus()
    },
    playNextLevel () {
      this.stats.lives++
      this.stats.level++
    },
    playSelectedLevel () {
      this.stats.level = this.selectedLevel
      this.selectedLevel = null
    },
    playFromBeginning () {
      this.stats.lives = 1
      this.stats.level = 1
    }
  }
}
</script>

<style lang="scss">
@import "./assets/style/main";

#app {
  font-family: sans-serif;
  color: $font_color;
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
  h4 {
    @include fontSizeRem(16, 24);
    margin-bottom: 1rem;
    @include breakpoint(desktop) {
      margin-bottom: 2rem;
    }
    &.success {
      color: $green;
    }
    &.fail {
      color: $red_pink;
    }
  }
  p {
    @include fontSizeRem(12, 20);
    margin-bottom: 2rem;
    @include breakpoint(desktop) {
      margin-bottom: 4rem;
    }
  }
  .select-level {
    display: flex;
    align-items: center;
    margin-top: -1rem;
    margin-bottom: 1rem;
    @include breakpoint(desktop) {
      margin-top: -3rem;
      margin-bottom: 3rem;
    }
    span {
      @include fontSizeRem(12, 20);
      margin-right: 1rem;
    }
  }
  .fade-enter-active, .fade-leave-active {
    transition: opacity .3s;
  }
  .fade-enter, .fade-leave-to {
    opacity: 0;
  }
}
</style>
