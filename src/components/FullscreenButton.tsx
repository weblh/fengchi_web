import React, { useState, useEffect, useRef } from 'react';
import { Button } from 'antd';
import { FullscreenOutlined, FullscreenExitOutlined } from '@ant-design/icons';

interface FullscreenButtonProps {
  containerRef?: React.RefObject<HTMLDivElement | null>;
  routeParams?: Record<string, string>;
}

const FullscreenButton: React.FC<FullscreenButtonProps> = ({ containerRef }) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const defaultRef = useRef<HTMLDivElement>(null);
  const targetRef = containerRef || defaultRef;

  // 全屏功能
  const toggleFullscreen = () => {
    if (!isFullscreen) {
      if (targetRef.current?.requestFullscreen) {
        targetRef.current.requestFullscreen({
          navigationUI: 'hide'
        });
      } else if ((targetRef.current as any)?.webkitRequestFullscreen) {
        (targetRef.current as any).webkitRequestFullscreen();
      } else if ((targetRef.current as any)?.msRequestFullscreen) {
        (targetRef.current as any).msRequestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if ((document as any)?.webkitExitFullscreen) {
        (document as any).webkitExitFullscreen();
      } else if ((document as any)?.msExitFullscreen) {
        (document as any).msExitFullscreen();
      }
    }
  };

  // 监听全屏状态变化
  useEffect(() => {
    const handleFullscreenChange = () => {
      const fullscreenElement = document.fullscreenElement || 
                               (document as any).webkitFullscreenElement || 
                               (document as any).msFullscreenElement;
      setIsFullscreen(!!fullscreenElement);
      
      // 确保全屏模式下能够滚动
      if (fullscreenElement) {
        // 使用setTimeout确保全屏状态完全生效后再设置样式
        setTimeout(() => {
          if (fullscreenElement) {
            // 为全屏元素设置滚动样式
            fullscreenElement.style.overflow = 'auto';
            fullscreenElement.style.overflowY = 'auto';
            fullscreenElement.style.overflowX = 'hidden';
            fullscreenElement.style.height = '100vh';
            fullscreenElement.style.maxHeight = '100vh';
            fullscreenElement.style.width = '100vw';
            fullscreenElement.style.maxWidth = '100vw';
            fullscreenElement.style.position = 'fixed';
            fullscreenElement.style.top = '0';
            fullscreenElement.style.left = '0';
            fullscreenElement.style.zIndex = '9999';
            
            // 为body和html设置样式
            document.body.style.overflow = 'auto';
            document.body.style.overflowY = 'auto';
            document.documentElement.style.overflow = 'auto';
            document.documentElement.style.overflowY = 'auto';
            
            // 确保全屏元素的所有子元素都能正常显示
            const children = fullscreenElement.querySelectorAll('*');
            children.forEach((child: Element) => {
              const element = child as HTMLElement;
              if (element.style) {
                element.style.position = 'relative';
              }
            });
          }
        }, 100);
      } else {
        // 恢复默认样式
        document.body.style.overflow = '';
        document.body.style.overflowY = '';
        document.documentElement.style.overflow = '';
        document.documentElement.style.overflowY = '';
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);
    
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
    };
  }, []);

  return (
    <Button 
      icon={isFullscreen ? <FullscreenExitOutlined /> : <FullscreenOutlined />} 
      onClick={toggleFullscreen}
    >
      {isFullscreen ? '退出全屏' : '进入全屏'}
    </Button>
  );
};

export default FullscreenButton;