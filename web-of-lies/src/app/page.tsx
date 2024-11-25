'use client';
import { useEffect, useRef, useState, useMemo } from "react";

interface Tweet {
  id: string;
  content: string;
  author: string;
  timestamp: Date;
  likes: number;
  retweets: number;
  isOriginal: boolean;
  variant: string;
  profilePic: string;
  parentId?: string;
  reactions: {
    angry: number;
    wow: number;
    support: number;
    skeptical: number;
  };
  category: string;
}

const PROFILE_PICS = Array.from({ length: 20 }, (_, i) => 
  `https://api.dicebear.com/7.x/avataaars/svg?seed=${i}`
);

const MISINFORMATION_CATEGORIES = {
  HEALTH: {
    name: "Health Misinformation",
    color: "rgb(220, 38, 38)",
    seeds: [
      {
        original: "🚨 New study shows common food additive linked to health issues! #Health",
        variants: [
          "My doctor friend confirmed this additive is dangerous! Spread the word!",
          "Big Food is poisoning us! Here's what they don't want you to know...",
          "Government REFUSES to ban toxic ingredient! Time to wake up!",
          "LEAKED documents show cover-up of additive dangers! RT before deleted!",
          "They're putting these chemicals in our food ON PURPOSE!",
          "My whole family got sick from this additive! WAKE UP!",
          "Insider reveals food industry's deadly secret agenda...",
          "Scientists who exposed the truth are being silenced!",
          "This is chemical warfare against the people! Share NOW!",
          "Breaking: Major food companies caught in massive cover-up!",
          "Former FDA employee speaks out about additive dangers!",
          "Studies being suppressed by Big Food lobbyists!",
          "Emergency: This common ingredient is in 80% of our food supply!",
          "Doctors worldwide are raising the alarm about this!",
          "They knew about the dangers for DECADES and did nothing!",
          "Alternative health experts have been warning us for years!",
          "The media won't report this because of food industry ads!",
          "Foreign countries have already banned this ingredient!",
          "Children are most at risk - parents need to know!",
          "Secret industry memo reveals shocking truth about additives!"
        ]
      }
    ]
  },
  POLITICS: {
    name: "Political Misinformation",
    color: "rgb(37, 99, 235)",
    seeds: [
      {
        original: "🔍 Strange patterns found in voting data... something's not right",
        variants: [
          "Election worker friend saw suspicious activity during count!",
          "PROOF of manipulation found in multiple districts!",
          "Whistleblower reveals massive election scheme!",
          "They're trying to silence us! Share this everywhere!",
          "Statistical impossibilities in voting patterns exposed!",
          "Inside source confirms voting machine tampering!",
          "Foreign interference CONFIRMED by cyber experts!",
          "Leaked emails show coordinated election manipulation!",
          "Multiple witnesses coming forward with evidence!",
          "Emergency: Democracy under attack - spread this now!",
          "They're deleting the evidence as we speak!",
          "Mathematical proof of vote switching discovered!",
          "Secret midnight ballot dumps caught on camera!",
          "Former election official exposes systematic fraud!",
          "Voting machines connected to foreign servers!",
          "Poll workers testify about late-night operations!",
          "Military intelligence has proof of interference!",
          "Alternative vote count shows different winner!",
          "Breaking: Thousands of ghost voters discovered!",
          "Election integrity experts sound the alarm!"
        ]
      }
    ]
  },
  TECHNOLOGY: {
    name: "Tech Misinformation",
    color: "rgb(16, 185, 129)",
    seeds: [
      {
        original: "New phones secretly recording everything we do 📱 #Privacy",
        variants: [
          "Tech insider confirms phones are always listening!",
          "Your data is being sold to foreign agencies!",
          "Phones are tracking your movements 24/7!",
          "Mass surveillance system exposed! Share before they censor!",
          "Hidden phone settings reveal constant monitoring!",
          "Ex-Silicon Valley engineer reveals spying capabilities!",
          "Smartphones secretly mining personal data at night!",
          "New update installs government tracking software!",
          "Tech companies sharing private messages with agencies!",
          "Microphone activated even when phone is off!",
          "Secret AI analyzing all your conversations!",
          "Phone cameras can be remotely activated!",
          "Your photos are being analyzed by foreign AI!",
          "Apps secretly access your data even when deleted!",
          "Emergency: New phone feature bypasses privacy settings!",
          "Whistleblower exposes massive data collection scheme!",
          "They're building profiles on everyone - wake up!",
          "Hidden code found that monitors brain patterns!",
          "5G towers amplifying phone surveillance capabilities!",
          "Breaking: Phones now recording sleep patterns!"
        ]
      }
    ]
  }
};

interface Node {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  tweet: Tweet;
  level: number;
  depth: number;
}

interface Link {
  source: Node;
  target: Node;
  strength: number;
}

const CANVAS_SETTINGS = {
  NODE_RADIUS: 30,
  REPULSION_STRENGTH: 1000,
  LINK_STRENGTH: 0.01,
  DAMPING: 0.98,
  CENTER_GRAVITY: 0.005,
  MIN_DISTANCE: 200,
  HIERARCHY_STRENGTH: 0.15,
  LEVEL_HEIGHT: 100,
  INITIAL_VELOCITY_DAMPING: 0.1,
  MAX_VELOCITY: 2,
};

const calculateNodeDepth = (tweet: Tweet, tweets: Tweet[]): number => {
  if (!tweet.parentId) return 0;
  
  const parent = tweets.find(t => t.id === tweet.parentId);
  if (!parent) return 1;
  
  return calculateNodeDepth(parent, tweets) + 1;
};

export default function Home() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [tweets, setTweets] = useState<Tweet[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>("HEALTH");
  const [isSimulationRunning, setIsSimulationRunning] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [stats, setStats] = useState({
    totalSpread: 0,
    reachPerMinute: 0,
    activeThreads: 0,
    categoryBreakdown: {
      HEALTH: 0,
      POLITICS: 0,
      TECHNOLOGY: 0
    },
    reactionBreakdown: {
      angry: 0,
      wow: 0,
      support: 0,
      skeptical: 0
    }
  });
  const [isPaused, setIsPaused] = useState(false);
  const [nodes, setNodes] = useState<Node[]>([]);
  const [links, setLinks] = useState<Link[]>([]);
  const animationFrameRef = useRef<number>();

  const generateUsername = () => {
    const adjectives = ['Truth', 'Real', 'Free', 'Patriot', 'Wake', 'Digital', 'Cosmic', 'Global'];
    const nouns = ['Seeker', 'Warrior', 'Thinker', 'Voice', 'Spirit', 'Insider', 'Guardian', 'Eye'];
    const numbers = Math.floor(Math.random() * 1000);
    return `${adjectives[Math.floor(Math.random() * adjectives.length)]}${nouns[Math.floor(Math.random() * nouns.length)]}${numbers}`;
  };

  const initializeNode = (tweet: Tweet, tweets: Tweet[]) => {
    const depth = calculateNodeDepth(tweet, tweets);
    const angle = Math.random() * Math.PI * 2;
    const radius = 50 + Math.random() * 50;
    
    const spreadFactor = depth * 100;
    
    return {
      id: tweet.id,
      x: window.innerWidth / 2 + Math.cos(angle) * (radius + spreadFactor),
      y: window.innerHeight / 4 + depth * CANVAS_SETTINGS.LEVEL_HEIGHT + (Math.random() - 0.5) * 25,
      vx: 0,
      vy: 0,
      tweet,
      level: depth,
      depth,
    };
  };

  useEffect(() => {
    const newNodes = tweets.map(tweet => {
      const existingNode = nodes.find(n => n.id === tweet.id);
      return existingNode || initializeNode(tweet, tweets);
    });

    newNodes.sort((a, b) => a.depth - b.depth);

    const newLinks = tweets
      .filter(tweet => tweet.parentId)
      .map(tweet => {
        const source = newNodes.find(n => n.id === tweet.parentId);
        const target = newNodes.find(n => n.id === tweet.id);
        return source && target ? { source, target, strength: CANVAS_SETTINGS.LINK_STRENGTH } : null;
      })
      .filter((link): link is Link => link !== null);

    setNodes(newNodes);
    setLinks(newLinks);
  }, [tweets]);

  useEffect(() => {
    if (!canvasRef.current || nodes.length === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    const drawLinks = () => {
      links.forEach(link => {
        const color = MISINFORMATION_CATEGORIES[link.target.tweet.category as keyof typeof MISINFORMATION_CATEGORIES].color;
        
        ctx.beginPath();
        ctx.moveTo(link.source.x, link.source.y);
        ctx.lineTo(link.target.x, link.target.y);
        ctx.strokeStyle = color;
        ctx.globalAlpha = 0.6; 
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.globalAlpha = 1; 

        const angle = Math.atan2(link.target.y - link.source.y, link.target.x - link.source.x);
        const arrowLength = 15;
        const arrowWidth = 8;
        
        ctx.beginPath();
        ctx.moveTo(
          link.target.x - arrowLength * Math.cos(angle) + arrowWidth * Math.sin(angle),
          link.target.y - arrowLength * Math.sin(angle) - arrowWidth * Math.cos(angle)
        );
        ctx.lineTo(link.target.x, link.target.y);
        ctx.lineTo(
          link.target.x - arrowLength * Math.cos(angle) - arrowWidth * Math.sin(angle),
          link.target.y - arrowLength * Math.sin(angle) + arrowWidth * Math.cos(angle)
        );
        ctx.fillStyle = color;
        ctx.fill();
      });
    };

    const updatePhysics = () => {
      nodes.forEach(node => {
        const targetY = window.innerHeight / 4 + node.depth * CANVAS_SETTINGS.LEVEL_HEIGHT;
        const dy = targetY - node.y;
        node.vy += dy * CANVAS_SETTINGS.HIERARCHY_STRENGTH;

        nodes.forEach(other => {
          if (node === other) return;
          
          const sameLevelMultiplier = node.depth === other.depth ? 2 : 1;
          const dx = other.x - node.x;
          const dy = other.y - node.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance === 0) return;

          if (distance < CANVAS_SETTINGS.MIN_DISTANCE) {
            const force = (CANVAS_SETTINGS.REPULSION_STRENGTH * sameLevelMultiplier) / (distance * distance);
            const multiplier = Math.pow((CANVAS_SETTINGS.MIN_DISTANCE - distance) / CANVAS_SETTINGS.MIN_DISTANCE, 2);
            
            const horizontalFactor = node.depth === other.depth ? 1.5 : 1;
            node.vx -= (dx / distance) * force * multiplier * horizontalFactor;
            node.vy -= (dy / distance) * force * multiplier;
          }
        });

        const depthFactor = 1 / (node.depth + 1);
        node.vx += (centerX - node.x) * CANVAS_SETTINGS.CENTER_GRAVITY * depthFactor;
      });

      links.forEach(link => {
        const dx = link.target.x - link.source.x;
        const dy = link.target.y - link.source.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance === 0) return;

        const idealDistance = 150;
        const force = (distance - idealDistance) * link.strength;
        const fx = (dx / distance) * force;
        const fy = (dy / distance) * force;

        link.source.vx += fx * CANVAS_SETTINGS.DAMPING;
        link.source.vy += fy * CANVAS_SETTINGS.DAMPING;
        link.target.vx -= fx * CANVAS_SETTINGS.DAMPING;
        link.target.vy -= fy * CANVAS_SETTINGS.DAMPING;
      });

      nodes.forEach(node => {
        node.vx *= CANVAS_SETTINGS.DAMPING;
        node.vy *= CANVAS_SETTINGS.DAMPING;

        node.x += node.vx;
        node.y += node.vy;

        const margin = CANVAS_SETTINGS.NODE_RADIUS;
        node.x = Math.max(margin, Math.min(canvas.width - margin, node.x));
        node.y = Math.max(margin, Math.min(canvas.height - margin, node.y));
      });

      ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      drawLinks();

      nodes.forEach(node => {
        if (node.tweet.isOriginal) {
          ctx.beginPath();
          ctx.arc(node.x, node.y, CANVAS_SETTINGS.NODE_RADIUS + 5, 0, Math.PI * 2);
          ctx.fillStyle = `${MISINFORMATION_CATEGORIES[node.tweet.category as keyof typeof MISINFORMATION_CATEGORIES].color}33`;
          ctx.fill();
        }

        const img = new Image();
        img.src = node.tweet.profilePic;
        
        ctx.save();
        ctx.beginPath();
        ctx.arc(node.x, node.y, CANVAS_SETTINGS.NODE_RADIUS, 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(
          img,
          node.x - CANVAS_SETTINGS.NODE_RADIUS,
          node.y - CANVAS_SETTINGS.NODE_RADIUS,
          CANVAS_SETTINGS.NODE_RADIUS * 2,
          CANVAS_SETTINGS.NODE_RADIUS * 2
        );
        
        ctx.strokeStyle = node.tweet.isOriginal 
          ? MISINFORMATION_CATEGORIES[node.tweet.category as keyof typeof MISINFORMATION_CATEGORIES].color
          : `${MISINFORMATION_CATEGORIES[node.tweet.category as keyof typeof MISINFORMATION_CATEGORIES].color}88`;
        ctx.lineWidth = 4;
        ctx.stroke();
        ctx.restore();

        const mouseX = mouse.x - canvas.getBoundingClientRect().left;
        const mouseY = mouse.y - canvas.getBoundingClientRect().top;
        const dx = mouseX - node.x;
        const dy = mouseY - node.y;
        if (dx * dx + dy * dy < CANVAS_SETTINGS.NODE_RADIUS * CANVAS_SETTINGS.NODE_RADIUS) {
          ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
          ctx.fillRect(mouseX + 10, mouseY + 10, 250, 80);
          ctx.fillStyle = 'white';
          ctx.font = '14px Arial';
          ctx.fillText(`@${node.tweet.author}`, mouseX + 20, mouseY + 30);
          ctx.font = '12px Arial';
          ctx.fillText(node.tweet.content, mouseX + 20, mouseY + 50, 230);
          ctx.fillStyle = 'gray';
          ctx.fillText(`❤️ ${node.tweet.likes} 🔄 ${node.tweet.retweets}`, mouseX + 20, mouseY + 70);
        }
      });

      animationFrameRef.current = requestAnimationFrame(updatePhysics);
    };

    updatePhysics();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [nodes, links]);

  const startNewSpread = () => {
    const category = MISINFORMATION_CATEGORIES[activeCategory as keyof typeof MISINFORMATION_CATEGORIES];
    const seed = category.seeds[0];
    
    const initialTweet: Tweet = {
      id: Math.random().toString(36),
      content: seed.original,
      author: generateUsername(),
      timestamp: new Date(),
      likes: 0,
      retweets: 0,
      isOriginal: true,
      variant: 'original',
      profilePic: PROFILE_PICS[Math.floor(Math.random() * PROFILE_PICS.length)],
      reactions: {
        angry: 0,
        wow: 0,
        support: 0,
        skeptical: 0
      },
      category: activeCategory
    };

    setTweets([initialTweet]);
    setIsSimulationRunning(true);
  };

  useEffect(() => {
    if (!isSimulationRunning || isPaused) return;

    const spreadInterval = setInterval(() => {
      setTweets(currentTweets => {
        const category = MISINFORMATION_CATEGORIES[activeCategory as keyof typeof MISINFORMATION_CATEGORIES];
        const seed = category.seeds[0];
        const newTweets = [...currentTweets];
        
        newTweets.forEach(tweet => {
          if (Math.random() < 0.3) { 
            tweet.likes += Math.floor(Math.random() * 15);
            tweet.retweets += Math.floor(Math.random() * 8);
            
            Object.keys(tweet.reactions).forEach(reaction => {
              tweet.reactions[reaction as keyof typeof tweet.reactions] += 
                Math.floor(Math.random() * 4);
            });
          }
        });

        const newTweetsToAdd = [];
        const maxNewTweets = Math.min(2, seed.variants.length - currentTweets.length + 1);
        
        for (let i = 0; i < maxNewTweets; i++) {
          if (Math.random() < 0.3 && currentTweets.length < seed.variants.length + 1) {
            const recentTweets = currentTweets.slice(-Math.min(3, currentTweets.length));
            const allPotentialParents = currentTweets.filter(t => calculateNodeDepth(t, currentTweets) < 4);
            const parentTweet = Math.random() < 0.7
              ? recentTweets[Math.floor(Math.random() * recentTweets.length)]
              : allPotentialParents[Math.floor(Math.random() * allPotentialParents.length)];

            const unusedVariants = seed.variants.filter(variant => 
              !currentTweets.some(tweet => tweet.content === variant)
            );
            
            if (unusedVariants.length > 0) {
              const variantContent = unusedVariants[Math.floor(Math.random() * unusedVariants.length)];
              
              const newTweet: Tweet = {
                id: Math.random().toString(36),
                content: variantContent,
                author: generateUsername(),
                timestamp: new Date(),
                likes: Math.floor(Math.random() * 15),
                retweets: Math.floor(Math.random() * 8),
                isOriginal: false,
                variant: `variant-${currentTweets.length}`,
                profilePic: PROFILE_PICS[Math.floor(Math.random() * PROFILE_PICS.length)],
                parentId: parentTweet.id,
                reactions: {
                  angry: Math.floor(Math.random() * 8),
                  wow: Math.floor(Math.random() * 8),
                  support: Math.floor(Math.random() * 8),
                  skeptical: Math.floor(Math.random() * 8)
                },
                category: activeCategory
              };
              
              newTweetsToAdd.push(newTweet);
            }
          }
        }

        const allNewTweets = [...currentTweets, ...newTweetsToAdd];
        const totalReactions = allNewTweets.reduce((acc, tweet) => ({
          angry: acc.angry + tweet.reactions.angry,
          wow: acc.wow + tweet.reactions.wow,
          support: acc.support + tweet.reactions.support,
          skeptical: acc.skeptical + tweet.reactions.skeptical
        }), { angry: 0, wow: 0, support: 0, skeptical: 0 });

        setStats(prev => ({
          totalSpread: prev.totalSpread + newTweetsToAdd.length,
          reachPerMinute: Math.floor(Math.random() * 200 + 100), 
          activeThreads: allNewTweets.length,
          categoryBreakdown: {
            ...prev.categoryBreakdown,
            [activeCategory]: prev.categoryBreakdown[activeCategory as keyof typeof prev.categoryBreakdown] + newTweetsToAdd.length
          },
          reactionBreakdown: totalReactions
        }));

        return allNewTweets;
      });
    }, 2000 / speed); 

    return () => clearInterval(spreadInterval);
  }, [isSimulationRunning, speed, activeCategory, isPaused]);

  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMouse({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="relative min-h-screen">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_500px] min-h-screen">
        <div className="relative h-screen">
          <canvas 
            ref={canvasRef} 
            className="absolute top-0 left-0 w-full h-full"
          />
          <div className="absolute top-4 left-4 bg-black/50 p-4 rounded-lg">
            <h2 className="text-2xl font-bold">Misinformation Network</h2>
            <p className="text-sm text-gray-300">Watch how false information spreads and connects</p>
          </div>
        </div>
        <div className="h-screen bg-black/90 p-4 flex flex-col">
          <h1 className="text-2xl font-bold mb-2">Live Misinformation Spread</h1>          
          <div className="bg-gray-900/80 p-3 rounded-lg mb-2">
            <div className="grid grid-cols-2 gap-2 mb-2">
              <select 
                value={activeCategory}
                onChange={(e) => setActiveCategory(e.target.value)}
                className="bg-gray-800 rounded p-1 text-sm"
              >
                {Object.entries(MISINFORMATION_CATEGORIES).map(([key, category]) => (
                  <option key={key} value={key}>{category.name}</option>
                ))}
              </select>
              <input 
                type="range" 
                min="0.5" 
                max="2" 
                step="0.1" 
                value={speed}
                onChange={(e) => setSpeed(parseFloat(e.target.value))}
                className="w-full"
              />
            </div>

            <div className="flex gap-1 mb-2">
              <button
                onClick={startNewSpread}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded text-sm"
                disabled={isSimulationRunning}
              >
                Start
              </button>
              <button
                onClick={() => setIsPaused(!isPaused)}
                className={`flex-1 ${
                  isPaused ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
                } text-white font-bold py-1 px-2 rounded text-sm`}
                disabled={!isSimulationRunning}
              >
                {isPaused ? 'Resume' : 'Pause'}
              </button>
              <button
                onClick={() => {
                  setIsSimulationRunning(false);
                  setTweets([]);
                  setStats({
                    totalSpread: 0,
                    reachPerMinute: 0,
                    activeThreads: 0,
                    categoryBreakdown: { HEALTH: 0, POLITICS: 0, TECHNOLOGY: 0 },
                    reactionBreakdown: { angry: 0, wow: 0, support: 0, skeptical: 0 }
                  });
                }}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-bold py-1 px-2 rounded text-sm"
                disabled={!isSimulationRunning}
              >
                Reset
              </button>
            </div>
            <div className="grid grid-cols-4 gap-1 text-center text-sm">
              <div className="bg-gray-800 p-1 rounded">
                <p>😠 {stats.reactionBreakdown.angry}</p>
              </div>
              <div className="bg-gray-800 p-1 rounded">
                <p>😮 {stats.reactionBreakdown.wow}</p>
              </div>
              <div className="bg-gray-800 p-1 rounded">
                <p>👍 {stats.reactionBreakdown.support}</p>
              </div>
              <div className="bg-gray-800 p-1 rounded">
                <p>🤔 {stats.reactionBreakdown.skeptical}</p>
              </div>
            </div>
          </div>
          <div className="flex-1 bg-gray-900/80 p-3 rounded-lg overflow-hidden">
            <h2 className="text-lg font-bold mb-2">Live Feed</h2>
            <div className="space-y-2 h-[calc(100vh-280px)] overflow-y-auto">
              {tweets.map((tweet) => (
                <div 
                  id={tweet.id}
                  key={tweet.id}
                  className="border border-gray-700 rounded-lg p-2 text-sm"
                  style={{
                    borderLeftColor: MISINFORMATION_CATEGORIES[tweet.category as keyof typeof MISINFORMATION_CATEGORIES].color,
                    borderLeftWidth: '4px',
                  }}
                >
                  <div className="flex items-start gap-2">
                    <img 
                      src={tweet.profilePic}
                      alt="Profile"
                      className="w-8 h-8 rounded-full flex-shrink-0"
                    />
                    <div className="flex-1">
                      <p className="font-bold">@{tweet.author}</p>
                      <p className="text-gray-300 break-words whitespace-normal">
                        {tweet.content}
                      </p>
                      <div className="flex flex-wrap gap-2 mt-1 text-xs text-gray-400">
                        <span>❤️ {tweet.likes}</span>
                        <span>🔄 {tweet.retweets}</span>
                        <span>{new Date(tweet.timestamp).toLocaleTimeString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
