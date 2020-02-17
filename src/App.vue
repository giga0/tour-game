<template>
  <div
    v-if="db_initialized"
    id="app">
    <!-- Header -->
    <header>
      <h1 class="heading">Tour Game</h1>
      <div class="menu">
        <btn
          @click="choosePlayerPopupOpened = true">
          Create / Switch player
        </btn>
      </div>
    </header>
    <!-- Main wrapper -->
    <main class="global-wrapper">
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
    </main>
    <!-- Global popup -->
    <transition name="fade">
      <popup
        v-if="levelStatus.finished || choosePlayerPopupOpened"
        :buttons="popupButtons"
        @reject="rejectButtonClicked"
        @confirm="confirmButtonClicked">
        <template v-slot:header>
          <h4 :class="popupHeaderClass">{{ popupHeader }}</h4>
        </template>
        <p>{{ popupText }}</p>
        <div
          v-if="levelStatus.failed && stats.lives || false"
          class="select">
          <span>Choose level:</span>
          <dropdown
            :items="dropdownItems"
            @selected="selectedDropdownValue($event)" />
        </div>
        <div
          v-if="choosePlayerPopupOpened"
          class="input">
          <span>Create new:</span>
          <input
            v-model="player"
            type="text" />
        </div>
      </popup>
    </transition>
  </div>
</template>

<script>
/* eslint-disable */
import IndexedDB from './api/idb'

import { getPossibleSteps, calculateTour } from './helpers/tourCalculationFunctions'

import Box from './components/Box'
import GameStats from './components/GameStats'
import Popup from './components/Popup'
import Dropdown from './components/Dropdown'
import Btn from './components/Button'

const cloneDeep = require('lodash.clonedeep')

export default {
  name: 'App',

  components: {
    Box,
    GameStats,
    Popup,
    Dropdown,
    Btn
  },
  
  data () {
    return {
      db_initialized: false,
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
      dropdownItems: [],
      selectedLevel: null,
      player: null,
      choosePlayerPopupOpened: false
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
      if (this.choosePlayerPopupOpened) header = 'Choose player'
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
      if (this.choosePlayerPopupOpened) text = 'You can choose existing or create a new player.'
      return text
    },
    popupButtons () {
      const buttons = {
        reject: { text: '', is_visible: true },
        confirm: { text: '', is_visible: true }
      }
      if (this.levelStatus.finished) {
        buttons.reject.text = 'No'
        buttons.confirm.text = 'Yes'
      }
      if (this.choosePlayerPopupOpened) {
        buttons.reject.text = 'Cancel'
        buttons.confirm.text = 'Confirm'
      }
      return buttons
    }
  },

  created () {
    this.board = this.generateBoard(5)
    const idb = new IndexedDB([ 'user_data', 'scores' ])
    idb.getDb().then(() => {
      this.db_initialized = true
    })
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
      if (this.stats.lives) {
        this.dropdownItems = []
        for (let i = this.stats.level - 1; i > 0; i--) {
          this.dropdownItems.push(i)
        }
      }
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
    },
    choosePlayer () {

    },
    rejectButtonClicked () {
      if (this.levelStatus.finished) this.resetLevelStatus()
      if (this.choosePlayerPopupOpened) this.choosePlayerPopupOpened = false
    },
    confirmButtonClicked () {
      if (this.levelStatus.finished) this.continuePlaying()
      if (this.choosePlayerPopupOpened) this.choosePlayer()
    },
    selectedDropdownValue (value) {
      if (this.levelStatus.finished) this.selectedLevel = value
      if (this.choosePlayerPopupOpened) this.player = value
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
  header {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: center;
    padding: 1rem;
    @include breakpoint(desktop) {
      flex-direction: row;
      padding: 2rem;
    }
    .heading {
      color: $black;
      @include fontSizeRem(20, 40);
      font-weight: 900;
      @include breakpoint(desktop) {
        position: relative;
        left: 50%;
        transform: translateX(-50%);
      }
    }
    .menu {
      margin-top: 1rem;
      @include breakpoint(desktop) {
        margin-top: 0;
      }
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
  .select {
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
  .input {
    display: flex;
    align-items: center;
    margin-top: -.5rem;
    margin-bottom: 1rem;
    @include breakpoint(desktop) {
      margin-top: -1.5rem;
      margin-bottom: 3rem;
    }
    span {
      @include fontSizeRem(12, 20);
      margin-right: 1rem;
    }
    input {
      @include fontSizeRem(12, 20);
      border: 1px solid $blue;
      border-radius: 5px;
      background-color: transparent;
      padding: .5rem;
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
