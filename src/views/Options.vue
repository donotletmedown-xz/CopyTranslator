<template>
  <div class="options-root">
    <div v-for="group in groupedActions" :key="group.key" class="options-group">
      <div v-if="group.title" class="options-group-title">
        {{ group.title }}
      </div>
      <div class="options-grid">
        <div
          v-for="action in group.items"
          :key="action.id"
          :class="['options-item', actionItemClass(action)]"
        >
          <Action :identifier="action.id"></Action>
        </div>
      </div>
    </div>
    <div class="options-restore" v-if="restoreButton">
      <SimpleButton @click="callback('restoreMultiDefault', optionType)">
        {{ trans["restoreMultiDefault"] }}
      </SimpleButton>
    </div>
  </div>
</template>

<script lang="ts">
import Action from "../components/Action.vue";
import { Prop, Component, Vue } from "vue-property-decorator";
import {
  Identifier,
  MenuActionType,
  Category,
  ActionView,
} from "../common/types";
import BaseView from "@/components/BaseView.vue";
import SimpleButton from "@/components/SimpleButton.vue";

@Component({
  components: {
    Action,
    SimpleButton,
  },
})
export default class Options extends BaseView {
  @Prop({ default: undefined }) readonly optionType!: MenuActionType | Category;
  @Prop({ default: true }) readonly restoreButton!: boolean;
  actionKeys: Identifier[] = this.$controller.action.getKeys(this.optionType);

  get groupedActions() {
    const actions = this.actionKeys.map((id) =>
      this.$controller.action.getAction(id)
    );
    const groups: Array<{
      key: string;
      title: string;
      items: ActionView[];
    }> = [];
    let index = 0;
    actions.forEach((action) => {
      const title = action.layout?.group || "";
      const last = groups[groups.length - 1];
      if (!last || last.title !== title) {
        groups.push({
          key: `${title || "group"}-${index++}`,
          title,
          items: [action],
        });
      } else {
        last.items.push(action);
      }
    });
    return groups;
  }

  actionItemClass(action: ActionView) {
    if (action.layout?.span && action.layout.span >= 1) {
      return "options-item-full";
    }
    if (
      action.actionType === "prompt" ||
      action.actionType === "multi_select"
    ) {
      return "options-item-full";
    }
    return "";
  }
}
</script>

<style scoped>
.options-root {
  text-align: left;
  overflow: auto;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.options-group {
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 12px;
  padding: 10px;
  background: rgba(255, 255, 255, 0.03);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.06);
}
.options-group-title {
  font-weight: 600;
  margin-bottom: 8px;
}
.options-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  grid-column-gap: 12px;
  grid-row-gap: 6px;
  align-content: start;
}
.options-item-full {
  grid-column: 1 / -1;
}
.options-restore {
  margin-top: 4px;
}
@media (max-width: 680px) {
  .options-grid {
    grid-template-columns: 1fr;
  }
}
</style>
