<template>
  <div id="app">
    <!-- Header -->
    <header>
      <h1 class="heading">Tour Game</h1>
      <div class="menu">
        <p>
          Player: {{ activePlayer ? activePlayer.name : '---' }}
        </p>
        <btn
          @click="choosePlayer">
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
              @click="boxClicked(item, [vIndex, hIndex])" />
          </template>
        </div>
        <game-stats :stats="stats" />
      </div>
      <div class="score-wrapper">
        <scores
          v-if="scores"
          :scores="scores"/>
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
        <p class="popup-text">{{ popupText }}</p>
        <transition name="fade">
          <div
            v-if="dropdown.items.length && !createdPlayer"
            class="select">
            <div>
              <span class="label">Choose:</span>
              <dropdown
                :items="dropdown.items"
                @selected="dropdownSelected($event)" />
            </div>
            <div v-if="choosePlayerPopupOpened && startLevelChoice.levels.length">
              <span class="label">Level to play:</span>
              <dropdown
                :items="startLevelChoice.levels"
                @selected="startLevelChoice.choosen = $event" />
            </div>
          </div>
        </transition>
        <div
          v-if="choosePlayerPopupOpened"
          class="input">
          <span class="label">Create new:</span>
          <input
            v-model="createdPlayer"
            type="text" />
        </div>
      </popup>
    </transition>
  </div>
</template>

<script>
/* eslint-disable */
import IndexedDB from './api/idb'
import config from './basic.config'

import { getPossibleSteps, calculateTour } from './helpers/tourCalculationFunctions'

import Box from './components/Box'
import GameStats from './components/GameStats'
import Scores from './components/Scores'
import Popup from './components/Popup'
import Dropdown from './components/Dropdown'
import Btn from './components/Button'

const idb = new IndexedDB([ 'players', 'scores' ])

const boardSize = 10

export default {
  name: 'App',

  //------------//
  // COMPONENTS //
  //------------//
  components: {
    Box,
    GameStats,
    Scores,
    Popup,
    Dropdown,
    Btn
  },
  
  //------//
  // DATA //
  //------//
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
        lives: 1,
        level: config.startLevel
      },
      dropdown: {
        items: [],
        selected: null
      },
      startLevelChoice: {
        levels: [],
        choosen: null
      },
      createdPlayer: null,
      choosePlayerPopupOpened: false,
      players: null,
      activePlayer: null,
      initialScores: null
    }
  },

  //----------//
  // COMPUTED //
  //----------//
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
    },
    scores () {
      let scores = this.initialScores
      if (this.activePlayer) scores = this.initialScores.filter(score => score.player.id === this.activePlayer.id)
      return scores
    }
  },

  //---------//
  // CREATED //
  //---------//
  created () {
    this.board = this.generateBoard(boardSize)
    this.getPlayers()
    this.getScores()

    // function that handles popup(list) visibility
    // within ScoreRow and Dropdown components
    const popupListVisibility = e => {
      const target = e.target
      const visiblePopup = document.getElementsByClassName('is-visible')[0]
      if (visiblePopup && !target.classList.contains('is-visible') && !target.offsetParent.classList.contains('is-visible')) {
        visiblePopup.classList.remove('is-visible')
      }
      if (target.classList.contains('time--more')) {
        target.classList.toggle('is-visible')
      }
      if (target.offsetParent && target.offsetParent.classList.contains('dropdown-wrapper')) {
        target.offsetParent.classList.toggle('is-visible')
      }
    }

    document.addEventListener('click', popupListVisibility)
    this.$on('hook:beforeDestroy', () => {
      document.removeEventListener('click', popupListVisibility)
    })
  },

  //---------//
  // METHODS //
  //---------//
  methods: {
    getPlayers () {
      return new Promise(resolve => {
        idb.getStore('players').then(players => {
          this.players = players
          resolve()
        })
      })
    },
    getPlayer (id) {
      return this.players.find(player => player.id === id)
    },
    getScores () {
      idb.getStore('scores').then(scores => {
        this.initialScores = scores
      })
    },
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
      const tour = calculateTour(boardSize, level, boxPosition)
      tour.shift()
      // generate steps based on tour/level
      for (let step of tour) {
        const boardItem = this.board[step[0]][step[1]]
        boardItem.is_set = true
        boardItem.currentStatus.future_step = true
      }
    },
    startTimer () {
      const timer = () => {
        if (this.levelStatus.finished) clearInterval(interval)
        else this.stats.timer++
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
      if (this.activePlayer) {
        this.saveScore()
        this.updatePlayerData()
      }
    },
    levelFailed () {
      const livesLeft = this.stats.lives - this.stats.leftToClick
      this.stats.lives = livesLeft <= 0 ? 0 : livesLeft
      this.levelStatus.finished = true
      this.levelStatus.failed = true
      if (this.stats.lives) {
        for (let i = this.stats.level - 1; i > 0; i--) {
          if (i >= config.startLevel) this.dropdown.items.push({ value: i })
        }
        if (!this.dropdown.items.length) this.dropdown.items.push({ value: config.startLevel })
      }
      if (this.activePlayer) this.updatePlayerData()
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
      }
      this.stats.leftToClick = 0
      this.stats.timer = 0
      this.start = true
      this.board = this.generateBoard(boardSize)
      this.resetLevelStatus()
    },
    playNextLevel () {
      this.stats.lives++
      this.stats.level++
    },
    playSelectedLevel () {
      this.stats.level = this.dropdown.selected.value
      this.dropdown.selected = null
    },
    playFromBeginning () {
      this.stats.lives = 1
      this.stats.level = config.startLevel
    },
    dropdownSelected (item) {
      this.dropdown.selected = item
      if (this.choosePlayerPopupOpened) {
        this.startLevelChoice.levels = []
        const player = this.getPlayer(item.id)
        for (let i = player.level; i > 0; i--) {
          if (i >= config.startLevel) this.startLevelChoice.levels.push({ value: i })
        }
        if (!this.startLevelChoice.levels.length) this.startLevelChoice.levels.push({ value: config.startLevel })
      }
    },
    choosePlayer () {
      for (let player of this.players) {
        this.dropdown.items.push({ id: player.id, value: player.name })
      }
      this.choosePlayerPopupOpened = true
    },
    playerChoosen () {
      if (this.createdPlayer) this.createNewPlayer()
      else {
        this.activePlayer = this.getPlayer(this.dropdown.selected.id)
        this.stats.lives = this.activePlayer.lives
        this.stats.level = this.startLevelChoice.choosen.value
      }
      this.choosePlayerPopupOpened = false
      this.dropdown.selected = null
      this.createdPlayer = null
      this.continuePlaying()
    },
    createNewPlayer () {
      const payload = {
        name: this.createdPlayer,
        lives: 1,
        level: config.startLevel
      }
      idb.saveData('players', payload).then(id => {
        this.getPlayers().then(() => {
          this.activePlayer = this.getPlayer(id)
          this.stats.lives = this.activePlayer.lives
          this.stats.level = this.activePlayer.level
        })
      })
    },
    updatePlayerData () {
      const payload = {
        id: this.activePlayer.id,
        name: this.activePlayer.name,
        lives: this.stats.lives,
        level: this.stats.level
      }
      if (this.levelStatus.completed) {
        payload.lives++
        payload.level++
      }
      if (this.levelStatus.failed) {
        payload.lives = payload.lives || 1
        payload.level = this.stats.lives ? payload.level : config.startLevel
      }
      idb.updateData('players', payload).then(() => {
        this.getPlayers()
      })
    },
    saveScore () {
      const payload = {
        player: {
          id: this.activePlayer.id,
          name: this.activePlayer.name
        },
        level: this.stats.level,
        time: this.stats.timer
      }
      idb.saveData('scores', payload).then(() => {
        this.getScores()
      })
    },
    rejectButtonClicked () {
      if (this.levelStatus.finished) this.resetLevelStatus()
      if (this.choosePlayerPopupOpened) this.choosePlayerPopupOpened = false
      this.dropdown.items = []
      this.startLevelChoice.levels = []
    },
    confirmButtonClicked () {
      if (this.levelStatus.finished) this.continuePlaying()
      if (this.choosePlayerPopupOpened) this.playerChoosen()
      this.dropdown.items = []
      this.startLevelChoice.levels = []
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
  max-width: 144rem;
  margin: 0 auto;
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
      display: flex;
      align-items: center;
      margin-top: 1rem;
      @include breakpoint(desktop) {
        margin-top: 0;
      }
      p {
        @include fontSizeRem(12, 20);
        font-weight: 700;
        margin-right: 2rem;
      }
    }
  }
  .global-wrapper {
    display: flex;
    flex-direction: column;
    padding: 1rem;
    @include breakpoint(desktop) {
      flex-direction: row;
      padding: 2rem;
    }
  }
  .game-wrapper {
    flex: 1 0 55%;
  }
  .score-wrapper {
    flex: 1 0 45%;
    margin-top: 3rem;
    @include breakpoint(desktop) {
      padding: 0 2rem;
      margin-top: 2rem;
    }
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
  .popup-text {
    @include fontSizeRem(12, 20);
    margin-bottom: 2rem;
    @include breakpoint(desktop) {
      margin-bottom: 4rem;
    }
  }
  .select {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: -1rem;
    margin-bottom: 1.5rem;
    @include breakpoint(desktop) {
      margin-top: -2rem;
      margin-bottom: 3rem;
    }
    .label {
      @include fontSizeRem(12, 20);
      display: inline-block;
      margin-right: 1rem;
      margin-bottom: .5rem;
    }
  }
  .input {
    display: flex;
    align-items: center;
    margin-top: -.5rem;
    margin-bottom: 1.5rem;
    @include breakpoint(desktop) {
      margin-top: -1rem;
      margin-bottom: 3rem;
    }
    .label {
      @include fontSizeRem(12, 20);
      margin-right: 1rem;
    }
    input {
      @include fontSizeRem(12, 20);
      border: 1px solid $blue;
      border-radius: 5px;
      background-color: transparent;
      width: 50%;
      padding: .5rem;
      @include breakpoint(desktop) {
        width: 46.6%;
        padding: .7rem;
      }
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
