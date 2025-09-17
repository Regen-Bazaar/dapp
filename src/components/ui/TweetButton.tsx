'use client';

import { Twitter } from 'lucide-react';

interface TweetButtonProps {
  tweetText: string;
}

const TweetButton: React.FC<TweetButtonProps> = ({ tweetText }) => {
  const handleTweet = () => {
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
      tweetText
    )}`;
    window.open(twitterUrl, '_blank');
  };

  return (
    <button
      onClick={handleTweet}
      className="flex items-center px-4 py-2 font-semibold text-[#B4F481] bg-transparent border border-[#B4F481] rounded transition-colors hover:bg-[#2A462C]"
    >
      <Twitter className="w-5 h-5 mr-2 fill-[#B4F481]" />
      Tweet
    </button>
  );
};

export default TweetButton;
