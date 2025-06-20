<script setup lang="ts">
import { ref } from "vue";
import * as mathUtils from "./mathUtils";
import Button from "./Button.vue";

const model = defineModel<number>({ required: true });

enum LoopMode {
  Loop,
  Zigzag,
}

const playing = ref(false);
const reverse = ref(false);
const loopMode = ref(LoopMode.Loop);

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

function goToZero() {
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
  const deltaInSeconds = (timestamp - lastTime) / 1000;
  if (playing.value) {
    let newValue =
      model.value + deltaInSeconds * 0.5 * (reverse.value ? -1 : 1);
    if (loopMode.value === LoopMode.Loop) {
      newValue = wrap(newValue);
    } else {
      if (newValue > 1 || newValue < -1.0) {
        reverse.value = !reverse.value;
      }
      newValue = fold(newValue);
    }
    model.value = newValue;
  }
  lastTime = timestamp;
  requestAnimationFrame(tick);
}
requestAnimationFrame(tick);

function setLoopMode(newLoopMode: LoopMode) {
  loopMode.value = newLoopMode;
  if (loopMode.value === LoopMode.Loop) {
    reverse.value = false;
  }
}
</script>

<template>
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
  <div class="flex flex-row w-full">
    <div class="flex-1 flex justify-start items-center gap-2">
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
      <Button @click="goToZero" square text="0" help="W = 0" />
      <Button
        :active="playing"
        @click="togglePlay"
        icon="play_arrow"
        help="Play"
      />
      <Button @click="pause" icon="pause" help="Pause" />
    </div>
    <div class="flex-1 flex justify-end items-center gap-2">
      <Button
        @click="setLoopMode(LoopMode.Loop)"
        :active="loopMode === LoopMode.Loop"
        icon="laps"
        help="Loop mode: wrap"
      />
      <!-- -scale-x-100 -->
      <Button
        @click="setLoopMode(LoopMode.Zigzag)"
        :active="loopMode === LoopMode.Zigzag"
        icon="turn_sharp_right"
        help="Loop mode: bounce"
      />
      <!-- rotate-45 -->
    </div>
  </div>
</template>
