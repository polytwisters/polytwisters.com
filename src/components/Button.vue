<script setup lang="ts">
import iconCamera from "@/assets/icons/camera.png";
import iconExpand from "@/assets/icons/expand.png";
import iconContract from "@/assets/icons/contract.png";
import iconLeft from "@/assets/icons/left.png";
import iconRight from "@/assets/icons/right.png";
import iconRandom from "@/assets/icons/random.png";
import iconStop from "@/assets/icons/stop.png";
import iconPause from "@/assets/icons/pause.png";
import iconPlus from "@/assets/icons/plus.png";
import iconMinus from "@/assets/icons/minus.png";
import iconHome from "@/assets/icons/home.png";
import iconPlay from "@/assets/icons/play.png";
import iconClose from "@/assets/icons/close.png";
import iconCheck from "@/assets/icons/check.png";

const map = new Map();
map.set("home", iconHome);
map.set("add", iconPlus);
map.set("remove", iconMinus);
map.set("photo_camera", iconCamera);
map.set("open_in_full", iconExpand);
map.set("close_fullscreen", iconContract);
map.set("skip_next", iconRight);
map.set("skip_previous", iconLeft);
map.set("casino", iconRandom);
map.set("stop", iconStop);
map.set("play_arrow", iconPlay);
map.set("pause", iconPause);
map.set("repeat", iconCamera);
map.set("close", iconClose);
map.set("check", iconCheck);

defineEmits<{ (e: "click"): void }>();
const props = defineProps<{
  active?: boolean;
  icon?: string;
  text?: string;
  help?: string;
  wide?: boolean;
}>();

const iconSource = map.get(props.icon ?? "stop");
</script>

<template>
  <div class="h-8">
    <button
      :class="{
        square: !text && !wide,
        active,
        flex: true,
        'gap-1': true,
        'items-center': true,
        'justify-center': true,
        'w-24': wide,
      }"
      @click="$emit('click')"
    >
      <div
        v-if="icon"
        class="material theme-default:inline-block! oldschool:hidden!"
      >
        {{ icon }}
      </div>
      <div v-if="icon" class="theme-default:hidden oldschool:inline size-fit">
        <img :src="iconSource" class="block" />
      </div>
      <div v-if="text">
        {{ text }}
      </div>
    </button>
  </div>
</template>
