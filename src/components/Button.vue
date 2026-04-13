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

const map = new Map();
map.set("home", iconHome);
map.set("add", iconPlus);
map.set("remove", iconMinus);
map.set("photo_camera", iconCamera);
map.set("open_in_full", iconExpand);
map.set("close_fullscreen", iconContract);
map.set("chevron_left", iconLeft);
map.set("chevron_right", iconRight);
map.set("casino", iconRandom);
map.set("stop", iconStop);
map.set("play_arrow", iconRight);
map.set("pause", iconPause);
map.set("repeat", iconCamera);

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
        square: !text,
        active,
        flex: true,
        'gap-1': true,
        'align-middle': true,
        'justify-center': true,
        'w-24': wide,
      }"
      @click="$emit('click')"
    >
      <span v-if="icon" class="material theme-default:inline-block! oldschool:hidden!">
        {{ icon }}
      </span>
      <span v-if="icon" class="theme-default:hidden oldschool:inline">
        <img :src="iconSource">
      </span>
      <span v-if="text">
        {{ text }}
      </span>
    </button>
  </div>
</template>
