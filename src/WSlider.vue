<script setup lang="ts">
import { ref } from "vue";
import * as mathUtils from "./mathUtils";
import * as globalState from "./globalState";
import Button from "./components/Button.vue";

const model = defineModel<number>({ required: true });

enum PlayMode {
  Loop,
  Zigzag,
  Autoplay,
  Shuffle,
}

const playing = ref(false);
const reverse = ref(false);
const playMode = ref(PlayMode.Loop);

let lastTime = 0;
function play() {
  playing.value = true;
  reverse.value = false;
}

function togglePlay() {
  if (playing.value) {
    pause();
  } else {
    play();
  }
}

function pause() {
  playing.value = false;
  reverse.value = false;
}

function stop() {
  playing.value = false;
  reverse.value = false;
  model.value = 0;
}

function wrap(value: number): number {
  return mathUtils.mod((value + 1) / 2, 1) * 2 - 1;
}

function fold(value: number): number {
  let newValue = mathUtils.mod(value, 4);
  if (1 <= newValue && newValue < 3) {
    newValue = 2 - newValue;
  }
  if (3 <= newValue) {
    newValue = newValue - 4;
  }
  return newValue;
}

function tick(timestamp: number) {
  let deltaInSeconds = (timestamp - lastTime) / 1000;

  // HACK: when compiling shaders we might get a really big delta, just ignore it and call it 0.
  if (deltaInSeconds > 0.1) {
    deltaInSeconds = 0;
  }

  if (playing.value) {
    let newValue = model.value + deltaInSeconds * 0.5 * (reverse.value ? -1 : 1);
    if (playMode.value === PlayMode.Loop) {
      newValue = wrap(newValue);
    } else if (playMode.value === PlayMode.Zigzag) {
      if (newValue > 1 || newValue < -1.0) {
        reverse.value = !reverse.value;
      }
      newValue = fold(newValue);
    } else if (playMode.value === PlayMode.Autoplay) {
      if (newValue >= 1) {
        newValue = -1;
        globalState.next();
      }
    } else if (playMode.value === PlayMode.Shuffle) {
      if (newValue >= 1) {
        newValue = -1;
        globalState.random();
      }
    }
    model.value = newValue;
  }
  lastTime = timestamp;
  requestAnimationFrame(tick);
}
requestAnimationFrame(tick);
</script>

<template>
  <div>
    <div class="relative">
      <input
        type="range"
        class="w-full"
        v-model.number="model"
        min="-1.0"
        max="1.0"
        step="0.0001"
        @pointerdown="pause"
      />
    </div>
    <div class="grid grid-rows-1 grid-cols-3 w-full">
      <div class="flex flex-row justify-start items-center gap-2">
        <div>Cross section <em>w</em></div>
        <div>=</div>
        <input
          class="bg-primary p-1 rounded-sm text-center"
          type="number"
          v-model.number="model"
          min="-1"
          max="1"
          step="0.01"
        />
      </div>
      <div class="flex-1 flex justify-center items-center gap-2">
        <Button
          @click="stop()"
          icon="stop"
          help="Stop"
        />
        <Button
          :active="playing"
          @click="togglePlay"
          icon="play_arrow"
          help="Play"
        />
        <Button @click="pause" icon="pause" help="Pause" />
      </div>

      <select v-model="playMode" class="button text-center justify-self-end">
        <option :value="PlayMode.Loop">Loop</option>
        <option :value="PlayMode.Zigzag">Bounce</option>
        <option :value="PlayMode.Autoplay">Autoplay</option>
        <option :value="PlayMode.Shuffle">Autoplay random</option>
      </select>
    </div>
  </div>
</template>
