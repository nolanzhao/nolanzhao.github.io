// Mermaid 图表渲染
document.addEventListener('DOMContentLoaded', function() {
  // 检查是否有 mermaid 代码块
  const mermaidBlocks = document.querySelectorAll('pre code.language-mermaid');
  
  if (mermaidBlocks.length > 0) {
    // 动态加载 Mermaid 库
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js';
    script.onload = function() {
      // 初始化 Mermaid
      mermaid.initialize({ 
        startOnLoad: false,
        theme: 'default',
        securityLevel: 'loose'
      });
      
      // 转换所有 mermaid 代码块
      mermaidBlocks.forEach(function(block, index) {
        const code = block.textContent;
        const id = 'mermaid-' + index;
        
        // 创建 mermaid 容器
        const div = document.createElement('div');
        div.className = 'mermaid';
        div.id = id;
        div.textContent = code;
        
        // 替换原始代码块
        block.parentElement.replaceWith(div);
      });
      
      // 渲染所有图表
      mermaid.run();
    };
    document.head.appendChild(script);
  }
  
  // 处理扩展 Markdown 语法
  processExtendedMarkdown();
});

// 处理扩展的 Markdown 语法
function processExtendedMarkdown() {
  const postContent = document.querySelector('.post-content');
  if (!postContent) return;
  
  // 处理文本节点
  processTextNodes(postContent);
}

function processTextNodes(element) {
  // 跳过代码块和脚本
  if (element.tagName === 'CODE' || element.tagName === 'PRE' || element.tagName === 'SCRIPT') {
    return;
  }
  
  // 处理所有文本节点
  const walker = document.createTreeWalker(
    element,
    NodeFilter.SHOW_TEXT,
    {
      acceptNode: function(node) {
        // 跳过代码块内的文本
        let parent = node.parentNode;
        while (parent && parent !== element) {
          if (parent.tagName === 'CODE' || parent.tagName === 'PRE') {
            return NodeFilter.FILTER_REJECT;
          }
          parent = parent.parentNode;
        }
        return NodeFilter.FILTER_ACCEPT;
      }
    }
  );
  
  const nodesToReplace = [];
  let node;
  
  while (node = walker.nextNode()) {
    const text = node.textContent;
    
    // 检查是否包含需要处理的语法
    if (text.includes('==') || text.includes('~') || text.includes('^')) {
      nodesToReplace.push(node);
    }
  }
  
  // 替换找到的节点
  nodesToReplace.forEach(function(node) {
    let html = node.textContent;
    
    // ==高亮== -> <mark>高亮</mark>
    html = html.replace(/==([^=]+)==/g, '<mark>$1</mark>');
    
    // H~2~O -> H<sub>2</sub>O （下标）
    html = html.replace(/(\w)~([^~\s]+)~/g, '$1<sub>$2</sub>');
    
    // X^2^ -> X<sup>2</sup> （上标）
    html = html.replace(/(\w)\^([^^<>\s]+)\^/g, '$1<sup>$2</sup>');
    
    if (html !== node.textContent) {
      const span = document.createElement('span');
      span.innerHTML = html;
      node.parentNode.replaceChild(span, node);
    }
  });
}
