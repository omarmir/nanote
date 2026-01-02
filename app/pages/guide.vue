<template>
  <UDashboardPanel id="guide">
    <template #header>
      <TopBar :name="t('navigation.guide')" />
    </template>

    <template #body>
      <UPageCard
        :title="t('guide.tips.title')"
        :description="t('guide.tips.subtitle')"
        variant="naked"
        orientation="horizontal" />
      <UPageCard
        variant="subtle"
        :ui="{ container: 'p-0 sm:p-0 gap-y-0', wrapper: 'items-stretch', header: 'p-4 mb-0 border-b border-default' }">
        <div class="py-3 text-sm font-medium sm:px-6">
          <pre class="py-2 whitespace-pre-line">
            <code># Heading
            **{{t('guide.tips.formatHelp.bold')}}**
            *{{t('guide.tips.formatHelp.italic')}}*
            - {{t('guide.tips.formatHelp.bulletItem')}}
            [{{t('guide.tips.formatHelp.link')}}](https://example.com)
            `{{t('guide.tips.formatHelp.inlineCode')}}`

            ```
            // {{t('guide.tips.formatHelp.codeBlock')}}
            console.log("{{t('guide.tips.formatHelp.helloWorld')}}");
            ```</code>
          </pre>
        </div>
      </UPageCard>

      <UPageCard
        :title="t('guide.directives.title')"
        :description="t('guide.directives.subtitle')"
        variant="naked"
        orientation="horizontal" />
      <UPageCard
        variant="subtle"
        :ui="{ container: 'p-0 sm:p-0 gap-y-0', wrapper: 'items-stretch', header: 'p-4 mb-0 border-b border-default' }">
        <li
          v-for="directive in directives"
          :key="directive"
          class="flex items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <p class="flex flex-row gap-2 truncate text-sm font-medium">
            <span class="text-primary">
              <pre>{{ `::${directive}` }}</pre>
            </span>
            {{ t(`guide.directives.actions.${directive}`) }}
          </p>
        </li>
      </UPageCard>
    </template>
  </UDashboardPanel>
</template>

<script lang="ts" setup>
const { t } = useI18n()

const directives = ['file', 'fileBlock', 'today', 'now', 'tomorrow', 'yesterday', 'time']
</script>
