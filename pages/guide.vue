<template>
  <CommonBaseCard class="px-4 pb-2 pt-5 lg:px-9">
    <h3 class="text-dark m-2 ml-0 flex flex-col items-start justify-center">
      <span class="mr-3 text-lg font-medium dark:text-gray-300">How to use Nanote</span>
      <span class="font-base mt-1 text-sm text-gray-600 dark:text-gray-400">
        Nanote is a simple, powerful markdown editor. Here's how to get started:
      </span>
    </h3>
    <div class="my-2">
      <h3 class="text-base font-semibold">Markdown Cheat Sheet</h3>
      <pre class="whitespace-pre-line py-2 text-white">
        <code># Heading  
        **Bold**  
        *Italic*  
        - Bullet Item  
        [Link](https://example.com)  
        `Inline code`  

        ```
        // Code block
        console.log("Hello world");
        ```</code>
      </pre>
    </div>
    <div class="my-2">
      <h3 class="text-base font-semibold">Nanote specific directives</h3>
      <div class="mt-2 flex flex-col gap-2">
        <div>
          <pre class="inline whitespace-pre-line pr-2 text-white">::file</pre>
          <span>Create an inline file picker allowing you to upload files</span>
        </div>
        <div>
          <pre class="inline whitespace-pre-line pr-2 text-white">::fileBlock</pre>
          <span>Create an file block (a larger icon taking up the whole line) picker allowing you to upload files</span>
        </div>
        <div>
          <pre class="inline whitespace-pre-line pr-2 text-white">::today</pre>
          <span>Will replace the directive with todays's date</span>
        </div>
        <div>
          <pre class="inline whitespace-pre-line pr-2 text-white">::now</pre>
          <span>Will replace the directive with todays's date and time</span>
        </div>
        <div>
          <pre class="inline whitespace-pre-line pr-2 text-white">::tomorrow</pre>
          <span>Will replace the directive with tomorrow's date</span>
        </div>
        <div>
          <pre class="inline whitespace-pre-line pr-2 text-white">::yesterday</pre>
          <span>Will replace the directive with yesterday's date</span>
        </div>
      </div>
    </div>
  </CommonBaseCard>
</template>
