<template>
  <van-popup
    :show="show"
    position="bottom"
    :style="{ height: '90%' }"
    round
    @update:show="$emit('update:show', $event)"
  >
    <div class="flex flex-col h-full">
      <van-search
        v-model="searchTerm"
        placeholder="搜尋..."
        @search="onSearch"
        @clear="onClear"
      />
      
      <div class="flex-1 overflow-y-auto">
        <van-list
          v-model:loading="loading"
          :finished="finished"
          finished-text="沒有更多了"
          @load="onLoad"
        >
          <van-cell
            v-for="item in list"
            :key="item.value"
            :title="item.label"
            clickable
            @click="onSelect(item)"
          />
        </van-list>
      </div>
      
      <div class="p-2 border-t">
        <van-button block @click="$emit('update:show', false)">關閉</van-button>
      </div>
    </div>
  </van-popup>
</template>

<script setup>
import { ref, watch, computed } from 'vue';
import { DriverListGet } from '@/assets/API/Drivers';
import { CustomersListGet } from '@/assets/API/Customers';
import { ProductListGet } from '@/assets/API/Product';

const props = defineProps({
  show: Boolean,
  dataSource: String,
});

const emit = defineEmits(['update:show', 'select']);

const searchTerm = ref('');
const list = ref([]);
const loading = ref(false);
const finished = ref(false);
const page = ref(1);
const limit = 20;

// Configuration map
const CONFIG = {
  drivers: {
    api: DriverListGet,
    format: (item) => ({ 
      value: item.id, 
      label: item.fullName || item.username || item.name,
      raw: item 
    })
  },
  customers: {
    api: CustomersListGet,
    format: (item) => ({ 
      value: item.id, 
      label: item.name,
      raw: item 
    })
  },
  products: {
    api: ProductListGet,
    format: (item) => ({ 
      value: item.id, 
      label: item.name,
      raw: item 
    })
  }
};

const currentConfig = computed(() => CONFIG[props.dataSource]);

const loadData = async (isRefresh = false) => {
  if (!currentConfig.value) {
    finished.value = true;
    return;
  }
  
  if (isRefresh) {
    page.value = 1;
    finished.value = false;
  }

  try {
    const params = {
      page: page.value,
      limit: limit,
      search: searchTerm.value || undefined
    };
    
    const res = await currentConfig.value.api(params);
    // Handle API response structure (usually data.data.data or data.data.items)
    const rawData = res.data?.data?.data || res.data?.data?.items || res.data?.data || [];
    const total = res.data?.data?.meta?.total ?? res.data?.data?.total ?? 0;
    
    const formatted = rawData.map(currentConfig.value.format);
    
    if (isRefresh) {
      list.value = formatted;
    } else {
      list.value.push(...formatted);
    }
    
    page.value++;
    if (list.value.length >= total || formatted.length < limit) {
      finished.value = true;
    }
  } catch (err) {
    console.error(err);
    finished.value = true;
  } finally {
    loading.value = false;
  }
};

const onLoad = () => {
  loadData();
};

const onSearch = () => {
  loading.value = true; // Show loading state in list usually, but here we reset
  loadData(true);
};

const onClear = () => {
  searchTerm.value = '';
  onSearch();
};

const onSelect = (item) => {
  emit('select', item.raw); // Emit the raw object as per logic requirements
  emit('update:show', false);
};

// Reset when source changes or opened
watch(() => props.show, (val) => {
  if (val) {
    // Optional: Auto refresh if list is empty or source changed?
    // For simplicity, we just keep list if same source, else reset.
    if (list.value.length === 0) {
      loadData(true);
    }
  }
});

watch(() => props.dataSource, () => {
  list.value = [];
  page.value = 1;
  searchTerm.value = '';
  if (props.show) loadData(true);
});

</script>
