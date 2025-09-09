import { RefObject, useEffect } from 'react';

export type UseInfiniteScrollProps = {
  containerRef: RefObject<HTMLElement | null>;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  isLoadingMore: boolean;
  onFetchNextPage: () => void;
  onScrollHeightChange?: (height: number) => void;
};

/**
 * Custom hook for infinite scroll functionality
 * Uses both IntersectionObserver and scroll event listener for better compatibility
 */
export const useInfiniteScroll = ({
  containerRef,
  hasNextPage,
  isFetchingNextPage,
  isLoadingMore,
  onFetchNextPage,
  onScrollHeightChange,
}: UseInfiniteScrollProps) => {
  useEffect(() => {
    const container = containerRef.current;
    if (!container || !hasNextPage || isFetchingNextPage || isLoadingMore)
      return;

    // Create a sentinel element at the top of the messages
    const sentinel = document.createElement('div');
    sentinel.style.height = '1px';
    sentinel.style.position = 'absolute';
    sentinel.style.top = '0';
    sentinel.style.left = '0';
    sentinel.style.right = '0';
    sentinel.style.pointerEvents = 'none';

    // Insert sentinel at the top of the conversation content
    const conversationContent = container.querySelector('.p-4'); // ConversationContent has className="p-4"
    if (conversationContent) {
      conversationContent.insertBefore(
        sentinel,
        conversationContent.firstChild,
      );
    }

    // IntersectionObserver approach
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          // Store current scroll height before fetching more messages
          if (onScrollHeightChange) {
            onScrollHeightChange(container.scrollHeight);
          }
          onFetchNextPage();
        }
      },
      {
        root: container,
        rootMargin: '100px 0px 0px 0px',
        threshold: 0.1,
      },
    );

    observer.observe(sentinel);

    // Backup scroll event listener
    const handleScroll = () => {
      const { scrollTop } = container;

      // Check if user has scrolled to the top (within 100px threshold)
      if (scrollTop <= 100) {
        // Store current scroll height before fetching more messages
        if (onScrollHeightChange) {
          onScrollHeightChange(container.scrollHeight);
        }
        onFetchNextPage();
      }
    };

    container.addEventListener('scroll', handleScroll);

    return () => {
      observer.disconnect();
      container.removeEventListener('scroll', handleScroll);
      if (sentinel.parentNode) {
        sentinel.parentNode.removeChild(sentinel);
      }
    };
  }, [
    containerRef,
    hasNextPage,
    isFetchingNextPage,
    isLoadingMore,
    onFetchNextPage,
    onScrollHeightChange,
  ]);
};
