<script setup lang="ts">
import { ref, type Ref } from "vue";
import * as mathUtils from "@/mathUtils";
import * as globalState from "@/globalState";
import Button from "@/components/Button.vue";

const model = defineModel<number>({ required: true });

const playing = ref(false);
const reverse = ref(false);

// If these strings are changed they must also be changed in the <option> values. See comment in
// HTML.
enum PlayMode {
  Loop = "loop",
  Bounce = "bounce",
  AutoplayNext = "autoplay_next",
  AutoplayRandom = "autoplay_random"
};
const playMode: Ref<PlayMode> = ref(PlayMode.Loop);

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
    } else if (playMode.value === PlayMode.Bounce) {
      if (newValue > 1 || newValue < -1.0) {
        reverse.value = !reverse.value;
      }
      newValue = fold(newValue);
    } else if (playMode.value === PlayMode.AutoplayNext) {
      // newValue < -1.0 handles a case where the W value is moving in reverse and we switch play
      // modes.
      if (newValue >= 1 || newValue < -1.0) {
        newValue = -1;
        globalState.next();
      }
    } else if (playMode.value === PlayMode.AutoplayRandom) {
      // newValue < -1.0 handles a case where the W value is moving in reverse and we switch play
      // modes.
      if (newValue >= 1 || newValue < -1.0) {
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
        <!--
        Ideally this would be e.g. :value="PlayMode.Loop" but this caused a strange bug where
        the dropdown would lock up, flicker, and the entire app would freeze if the play mode was
        changed while the slider was playing. It happens even if the <select>'s v-model isn't hooked
        into the app's behavior, so I suspect a dank Vue internals issue.
        -->
        <option value="loop">Loop</option>
        <option value="bounce">Bounce</option>
        <option value="autoplay_next">Autoplay next</option>
        <option value="autoplay_random">Autoplay random</option>
      </select>
    </div>
  </div>
</template>
