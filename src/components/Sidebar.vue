<!-- filepath: c:\Users\Mcola.Tech\不改动版本\data-view\src\components\Sidebar.vue -->
<template>
  <div class="sidebar">
    <!-- ...existing menu items... -->
    
    <!-- 🔥 新增热力图分析菜单项 -->
    <router-link to="/heatmap" class="menu-item" active-class="active">
      <div class="menu-icon">
        <i class="el-icon-s-data"></i>
      </div>
      <div class="menu-content">
        <h3>热力图相关性分析</h3>
        <p>因素关联分析</p>
      </div>
      <div class="menu-indicator">
        <i class="el-icon-arrow-right"></i>
      </div>
    </router-link>
    
    <!-- ...existing menu items... -->
  </div>
</template>