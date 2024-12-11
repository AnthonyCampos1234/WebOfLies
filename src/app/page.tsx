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

interface CommentaryPopupProps {
  isOpen: boolean;
  onClose: () => void;
  tweet: Tweet;
  philosophicalMode: string;
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

const PHILOSOPHICAL_MODES = {
  POSTMAN: {
    name: "Neil Postman",
    description: "Media ecology perspective",
    getCommentary: (tweet: Tweet) => {
      switch (tweet.category) {
        case "HEALTH":
          if (tweet.content.includes("doctor friend")) {
            return "Notice how personal anecdotes from 'authority figures' are used to bypass scientific processes - a common tactic in our entertainment-focused media.";
          } else if (tweet.content.includes("LEAKED") || tweet.content.includes("cover-up")) {
            return "The dramatic language of 'leaks' and 'cover-ups' transforms health information into entertainment spectacle, prioritizing sensation over science.";
          } else if (tweet.content.includes("Big Food")) {
            return "Complex health issues are reduced to simplistic narratives of good versus evil, characteristic of entertainment media.";
          } else if (tweet.content.includes("WAKE UP")) {
            return "The dramatic 'wake up' call turns health information into a form of entertainment rebellion narrative.";
          } else if (tweet.content.includes("scientists who exposed")) {
            return "Scientific process is transformed into a dramatic narrative of heroic revelation, typical of entertainment media.";
          } else if (tweet.content.includes("chemical warfare")) {
            return "Health concerns are repackaged as dramatic warfare narratives, prioritizing entertainment value over scientific accuracy.";
          } else if (tweet.content.includes("alternative health")) {
            return "The medium favors alternative narratives that entertain over mainstream science that informs.";
          } else if (tweet.content.includes("emergency")) {
            return "Notice how health information is framed as urgent drama to capture attention in our entertainment-driven media.";
          } else if (tweet.content.includes("foreign countries")) {
            return "International comparisons are simplified into dramatic narratives that ignore complex policy contexts.";
          } else if (tweet.content.includes("media won't report")) {
            return "The narrative of media suppression creates drama while undermining legitimate health journalism.";
          }
          return "Health misinformation thrives in our entertainment-driven media environment where dramatic claims spread faster than scientific evidence.";
        
        case "POLITICS":
          if (tweet.content.includes("whistleblower")) {
            return "The 'whistleblower' narrative turns political discourse into a dramatic storyline, emphasizing entertainment over factual analysis.";
          } else if (tweet.content.includes("PROOF") || tweet.content.includes("evidence")) {
            return "Claims of 'proof' are presented as dramatic revelations rather than parts of a methodical verification process.";
          } else if (tweet.content.includes("silence")) {
            return "The persecution narrative creates compelling drama while undermining rational political discourse.";
          } else if (tweet.content.includes("midnight")) {
            return "Time-specific details are used to create dramatic tension, turning political process into entertainment.";
          } else if (tweet.content.includes("military intelligence")) {
            return "Appeals to secretive authorities create dramatic intrigue while bypassing normal verification channels.";
          } else if (tweet.content.includes("ghost voters")) {
            return "Dramatic terminology transforms mundane electoral processes into entertainment spectacle.";
          } else if (tweet.content.includes("foreign servers")) {
            return "International intrigue is invoked for dramatic effect, overshadowing domestic electoral processes.";
          } else if (tweet.content.includes("caught on camera")) {
            return "Visual evidence is promised as dramatic reveal, typical of entertainment media formats.";
          } else if (tweet.content.includes("alternative vote count")) {
            return "Competing narratives are presented as dramatic conflict rather than methodological disagreement.";
          } else if (tweet.content.includes("breaking:")) {
            return "The 'breaking news' format prioritizes immediacy and drama over verification and context.";
          }
          return "Political discourse has been reduced to entertainment spectacle, where emotional appeal trumps reasoned debate.";
        
        case "TECHNOLOGY":
          if (tweet.content.includes("listening")) {
            return "Fear of surveillance is amplified by our media's tendency to sensationalize technology's capabilities.";
          } else if (tweet.content.includes("tracking")) {
            return "Technology fears are packaged into entertaining conspiracy narratives, disconnected from technical reality.";
          } else if (tweet.content.includes("secretly")) {
            return "The medium promotes sensational claims about secret technological capabilities over nuanced understanding.";
          } else if (tweet.content.includes("spying")) {
            return "Surveillance narratives are dramatized for entertainment value, obscuring real privacy concerns.";
          } else if (tweet.content.includes("AI")) {
            return "AI capabilities are sensationalized in ways that prioritize entertainment over technical accuracy.";
          } else if (tweet.content.includes("remote")) {
            return "Remote control narratives create dramatic tension while oversimplifying technical realities.";
          } else if (tweet.content.includes("brain patterns")) {
            return "Neurological concepts are sensationalized into science-fiction narratives for entertainment value.";
          } else if (tweet.content.includes("5G")) {
            return "Technical infrastructure is dramatized into entertainment narratives that ignore engineering realities.";
          } else if (tweet.content.includes("sleep patterns")) {
            return "Personal data collection is transformed into dramatic surveillance narratives.";
          } else if (tweet.content.includes("hidden code")) {
            return "Technical processes are mystified into entertainment narratives of hidden control.";
          }
          return "Technology itself shapes the message - social media's rapid-fire nature promotes sensationalism over substance.";
      }
      return "The medium shapes the message, often prioritizing entertainment over truth.";
    }
  },
  PEIRCE: {
    name: "Charles Peirce",
    description: "Pragmatic approach to truth",
    getCommentary: (tweet: Tweet) => {
      switch (tweet.category) {
        case "HEALTH":
          if (tweet.content.includes("study shows")) {
            return "What's the methodology of this study? Scientific truth requires rigorous experimental design and peer review.";
          } else if (tweet.content.includes("doctor friend")) {
            return "Anecdotal evidence, even from medical professionals, cannot replace systematic scientific investigation.";
          } else if (tweet.content.includes("LEAKED")) {
            return "Leaked documents require verification through established scientific channels to constitute valid evidence.";
          } else if (tweet.content.includes("Big Food")) {
            return "This conspiratorial framing lacks falsifiable hypotheses - what specific claims can be tested?";
          } else if (tweet.content.includes("chemical")) {
            return "Chemical interactions require precise scientific study, not vague allegations. What specific compounds? What mechanisms of action?";
          } else if (tweet.content.includes("scientists who exposed")) {
            return "Scientific findings gain validity through peer review and replication, not dramatic exposés.";
          } else if (tweet.content.includes("alternative health")) {
            return "Alternative treatments must meet the same standards of empirical verification as conventional medicine.";
          } else if (tweet.content.includes("foreign countries")) {
            return "Cross-national comparisons require careful control for confounding variables and regulatory differences.";
          } else if (tweet.content.includes("emergency")) {
            return "Urgency does not override the need for proper scientific methodology and peer review.";
          } else if (tweet.content.includes("80%")) {
            return "Statistical claims require clear methodology: What's the sample size? Control group? Confidence interval?";
          }
          return "Medical claims require rigorous scientific testing - anecdotal evidence and correlation are not sufficient for establishing causation.";
        
        case "POLITICS":
          if (tweet.content.includes("statistical")) {
            return "Statistical claims require transparent methodology and raw data for verification - assertions alone are insufficient.";
          } else if (tweet.content.includes("proof")) {
            return "What constitutes this 'proof'? Valid evidence must be testable and reproducible.";
          } else if (tweet.content.includes("sources")) {
            return "Anonymous sources must be corroborated through verifiable evidence and established methodologies.";
          } else if (tweet.content.includes("patterns")) {
            return "Pattern recognition requires statistical rigor - what's the null hypothesis? What's the p-value?";
          } else if (tweet.content.includes("midnight")) {
            return "Temporal correlations need causal mechanisms - timing alone doesn't prove intent.";
          } else if (tweet.content.includes("foreign")) {
            return "Claims of foreign involvement require concrete, verifiable evidence, not mere speculation.";
          } else if (tweet.content.includes("mathematical")) {
            return "Mathematical proof requires formal demonstration, not just numerical coincidences.";
          } else if (tweet.content.includes("cyber")) {
            return "Digital forensics demands rigorous methodology and reproducible results.";
          } else if (tweet.content.includes("expert")) {
            return "Expert claims must be verified through peer review and empirical testing.";
          } else if (tweet.content.includes("evidence")) {
            return "What type of evidence? How was it collected? Can it be independently verified?";
          }
          return "Political claims must be grounded in verifiable evidence, not mere speculation or partisan rhetoric.";
        
        case "TECHNOLOGY":
          if (tweet.content.includes("always listening")) {
            return "Such claims need empirical testing: What data shows devices are constantly recording? How was this verified?";
          } else if (tweet.content.includes("tracking")) {
            return "Tracking claims require technical verification through controlled testing and peer review.";
          } else if (tweet.content.includes("monitoring")) {
            return "What measurable evidence supports these monitoring claims? Assertions need technical validation.";
          } else if (tweet.content.includes("AI")) {
            return "AI capabilities must be demonstrated through reproducible experiments, not speculative claims.";
          } else if (tweet.content.includes("hidden code")) {
            return "Code analysis requires systematic review and verification - what's the evidence for these hidden functions?";
          } else if (tweet.content.includes("remote")) {
            return "Remote access claims need technical proof: What protocols? What security vulnerabilities?";
          } else if (tweet.content.includes("data mining")) {
            return "Data collection claims require specific technical evidence about methods and scope.";
          } else if (tweet.content.includes("surveillance")) {
            return "Surveillance capabilities need technical verification - what specific mechanisms are being claimed?";
          } else if (tweet.content.includes("5G")) {
            return "5G claims must be tested against established principles of electromagnetic physics.";
          } else if (tweet.content.includes("brain patterns")) {
            return "Neurological claims require rigorous scientific validation through controlled studies.";
          }
          return "Technical claims need empirical verification through controlled testing and peer review.";
      }
      return "Without experimental validation, this remains mere speculation.";
    }
  },
  NGUYEN: {
    name: "C Thi Nguyen",
    description: "Echo chambers expert",
    getCommentary: (tweet: Tweet) => {
      switch (tweet.category) {
        case "HEALTH":
          if (tweet.content.includes("They don't want you to know")) {
            return "Classic echo chamber rhetoric: creating an us-vs-them narrative that dismisses outside expertise.";
          } else if (tweet.content.includes("wake up")) {
            return "The 'wake up' call is a common echo chamber tactic, implying special insider knowledge while dismissing mainstream sources.";
          } else if (tweet.content.includes("Big")) {
            return "Demonizing institutions ('Big' entities) reinforces echo chamber walls by discrediting potential contrary evidence.";
          } else if (tweet.content.includes("doctor friend")) {
            return "Echo chambers often elevate informal, unverifiable sources that confirm existing beliefs while rejecting institutional expertise.";
          } else if (tweet.content.includes("LEAKED")) {
            return "The appeal to secret knowledge is a classic echo chamber tactic - it can't be verified by outsiders, making it immune to criticism.";
          } else if (tweet.content.includes("alternative health")) {
            return "Alternative health communities often function as echo chambers, where skepticism of mainstream medicine reinforces group identity.";
          } else if (tweet.content.includes("media won't report")) {
            return "By discrediting mainstream sources, echo chambers become the only trusted source of information.";
          } else if (tweet.content.includes("scientists who exposed")) {
            return "Echo chambers often lionize 'rebel' experts who confirm their beliefs while dismissing the broader scientific consensus.";
          } else if (tweet.content.includes("foreign countries")) {
            return "Selective use of foreign examples creates an illusion of evidence while ignoring contradicting international data.";
          } else if (tweet.content.includes("chemical warfare")) {
            return "Extreme interpretations thrive in echo chambers where moderate voices have been systematically excluded.";
          }
          return "Health misinformation thrives in echo chambers where alternative medicine communities reinforce each other's beliefs while rejecting mainstream medical evidence.";
        
        case "POLITICS":
          if (tweet.content.includes("silence")) {
            return "Claims of silencing often serve to preemptively discredit contrary evidence within political echo chambers.";
          } else if (tweet.content.includes("media won't report")) {
            return "Dismissing mainstream media creates a closed information loop where only confirming sources are trusted.";
          } else if (tweet.content.includes("truth")) {
            return "Echo chambers often claim monopoly on 'truth' while systematically excluding contrary evidence.";
          } else if (tweet.content.includes("whistleblower")) {
            return "Whistleblower narratives in echo chambers often lack the scrutiny applied to contradicting evidence.";
          } else if (tweet.content.includes("caught on camera")) {
            return "Selective interpretation of evidence reinforces existing beliefs within the echo chamber.";
          } else if (tweet.content.includes("military intelligence")) {
            return "Appeals to shadowy authorities are common in echo chambers - they can't be verified but confirm existing beliefs.";
          } else if (tweet.content.includes("foreign servers")) {
            return "Complex technical claims thrive in echo chambers where expertise is selectively accepted or rejected.";
          } else if (tweet.content.includes("breaking:")) {
            return "The urgency of 'breaking' news discourages careful evaluation, reinforcing echo chamber dynamics.";
          } else if (tweet.content.includes("alternative vote count")) {
            return "Parallel knowledge structures emerge in echo chambers, complete with their own experts and methodologies.";
          } else if (tweet.content.includes("ghost voters")) {
            return "Echo chambers can transform mundane irregularities into evidence of vast conspiracies.";
          }
          return "Political echo chambers create epistemic bubbles where opposing viewpoints are systematically filtered out and discredited.";
        
        case "TECHNOLOGY":
          if (tweet.content.includes("insider")) {
            return "Claims of insider knowledge create artificial authority within tech echo chambers.";
          } else if (tweet.content.includes("They're")) {
            return "The vague 'they' creates a shadowy opponent, typical of conspiracy-focused echo chambers.";
          } else if (tweet.content.includes("exposed")) {
            return "'Exposure' narratives in tech echo chambers often lack external verification.";
          } else if (tweet.content.includes("listening")) {
            return "Tech echo chambers often amplify surveillance fears beyond technical realities.";
          } else if (tweet.content.includes("AI")) {
            return "AI capabilities are often mythologized in tech echo chambers, creating unrealistic fears and expectations.";
          } else if (tweet.content.includes("hidden code")) {
            return "Technical complexity in echo chambers often gets reinterpreted as intentional malice.";
          } else if (tweet.content.includes("5G")) {
            return "Echo chambers can transform technical infrastructure into objects of fear through collective reinforcement.";
          } else if (tweet.content.includes("brain patterns")) {
            return "Scientific concepts get distorted in echo chambers where technical accuracy is less valued than confirming existing fears.";
          } else if (tweet.content.includes("remote")) {
            return "Remote access capabilities are often exaggerated in echo chambers where technical limitations are ignored.";
          } else if (tweet.content.includes("data mining")) {
            return "Data collection concerns get amplified in echo chambers where worst-case scenarios are treated as certainties.";
          }
          return "Tech communities can become echo chambers where conspiracy theories about surveillance and control go unchallenged.";
      }
      return "Echo chambers reinforce existing beliefs while excluding contrary evidence.";
    }
  },
  LEONELLI: {
    name: "Sabina Leonelli",
    description: "Data-centric analysis",
    getCommentary: (tweet: Tweet) => {
      switch (tweet.category) {
        case "HEALTH":
          if (tweet.content.includes("study shows")) {
            return "Individual studies need proper context within the broader body of medical research data.";
          } else if (tweet.content.includes("80%")) {
            return "Statistics without proper context and methodology can mislead - what's the source and scope of this percentage?";
          } else if (tweet.content.includes("linked to")) {
            return "Correlation claims require careful data analysis to establish causation.";
          } else if (tweet.content.includes("doctor friend")) {
            return "Anecdotal data points cannot substitute for systematic data collection and analysis.";
          } else if (tweet.content.includes("LEAKED")) {
            return "Raw data without proper curation and methodological context can lead to misinterpretation.";
          } else if (tweet.content.includes("worldwide")) {
            return "Global data requires careful standardization and cross-cultural validation.";
          } else if (tweet.content.includes("scientists")) {
            return "Scientific data must be situated within its full experimental and methodological context.";
          } else if (tweet.content.includes("evidence")) {
            return "What's the quality and completeness of the underlying dataset?";
          } else if (tweet.content.includes("research")) {
            return "Research data requires proper documentation of collection methods and analytical procedures.";
          } else if (tweet.content.includes("studies")) {
            return "Multiple studies need systematic meta-analysis, not cherry-picked results.";
          }
          return "Health data requires careful curation and context - isolated statistics can be misleading without proper medical interpretation.";
        
        case "POLITICS":
          if (tweet.content.includes("patterns")) {
            return "Data patterns require rigorous statistical analysis and complete datasets, not cherry-picked examples.";
          } else if (tweet.content.includes("evidence")) {
            return "What's the quality and completeness of this evidence? Partial data can create misleading narratives.";
          } else if (tweet.content.includes("proof")) {
            return "Claims of proof need transparent access to complete, verifiable datasets.";
          } else if (tweet.content.includes("statistical")) {
            return "Statistical analysis requires complete datasets and transparent methodologies.";
          } else if (tweet.content.includes("numbers")) {
            return "Raw numbers without proper context and methodology can be misleading.";
          } else if (tweet.content.includes("analysis")) {
            return "What analytical methods were used? Are they appropriate for this type of data?";
          } else if (tweet.content.includes("records")) {
            return "Record-keeping methodology and completeness are crucial for valid conclusions.";
          } else if (tweet.content.includes("data shows")) {
            return "What's the broader context of this data? What collection methods were used?";
          } else if (tweet.content.includes("confirmed")) {
            return "Confirmation requires systematic data validation and peer review.";
          } else if (tweet.content.includes("discovered")) {
            return "New discoveries must be validated through systematic data analysis.";
          }
          return "Political data can be manipulated through selective presentation - we need transparent access to complete datasets.";
        
        case "TECHNOLOGY":
          if (tweet.content.includes("always")) {
            return "Absolute claims about technology require comprehensive data collection and analysis.";
          } else if (tweet.content.includes("tracking")) {
            return "Technical tracking claims need precise data about methods, scope, and limitations.";
          } else if (tweet.content.includes("monitoring")) {
            return "Monitoring claims require detailed technical data about capabilities and limitations.";
          } else if (tweet.content.includes("data mining")) {
            return "Data mining claims need specific information about collection methods and scope.";
          } else if (tweet.content.includes("AI")) {
            return "AI capabilities must be documented with specific technical parameters and limitations.";
          } else if (tweet.content.includes("algorithm")) {
            return "Algorithmic claims require detailed technical documentation and validation data.";
          } else if (tweet.content.includes("system")) {
            return "System capabilities must be verified through comprehensive technical data.";
          } else if (tweet.content.includes("analysis")) {
            return "Technical analysis requires complete datasets and documented methodologies.";
          } else if (tweet.content.includes("privacy")) {
            return "Privacy implications must be assessed through systematic data analysis.";
          } else if (tweet.content.includes("security")) {
            return "Security claims require comprehensive technical documentation and testing data.";
          }
          return "Technical data must be evaluated within its full socio-technical context, not cherry-picked for dramatic effect.";
      }
      return "Data without proper context and curation can mislead rather than inform.";
    }
  },
  DESCARTES: {
    name: "René Descartes",
    description: "Methodological skepticism",
    getCommentary: (tweet: Tweet) => {
      switch (tweet.category) {
        case "HEALTH":
          if (tweet.content.includes("study shows")) {
            return "Let us doubt everything except what can be clearly and distinctly proven. What foundational evidence supports this study?";
          } else if (tweet.content.includes("doctor friend")) {
            return "Personal testimony, no matter how authoritative, must be subjected to methodical doubt. What indubitable facts support this claim?";
          } else if (tweet.content.includes("LEAKED")) {
            return "Even seemingly concrete evidence must be doubted. How can we be certain these leaks aren't deceptive?";
          } else if (tweet.content.includes("Big Food")) {
            return "We must strip away assumptions about institutional motives and examine only what can be proven through reason.";
          } else if (tweet.content.includes("chemical")) {
            return "Let us break down these chemical claims into their simplest components and examine what we can know with absolute certainty.";
          } else if (tweet.content.includes("scientists who exposed")) {
            return "Authority alone is insufficient - what clear and distinct ideas can we derive from this exposure?";
          } else if (tweet.content.includes("alternative health")) {
            return "We must doubt both conventional and alternative approaches equally until we find indubitable truths.";
          } else if (tweet.content.includes("emergency")) {
            return "Urgency should not override the need for methodical doubt and clear reasoning.";
          } else if (tweet.content.includes("cover-up")) {
            return "Claims of concealment require us to examine what we can know with absolute certainty versus what we merely suspect.";
          } else if (tweet.content.includes("evidence")) {
            return "What aspects of this evidence can withstand systematic doubt? What remains indubitably true?";
          }
          return "In matters of health, we must doubt everything until we reach clear and distinct ideas that cannot be doubted.";

        case "POLITICS":
          if (tweet.content.includes("patterns")) {
            return "What patterns can we establish through pure reason, setting aside all preconceptions and biases?";
          } else if (tweet.content.includes("proof")) {
            return "What aspects of this proof can withstand systematic doubt? What foundational truths remain?";
          } else if (tweet.content.includes("sources")) {
            return "Even trusted sources must be doubted. What can we establish through reason alone?";
          } else if (tweet.content.includes("whistleblower")) {
            return "Let us set aside the emotional appeal and examine what can be known with mathematical certainty.";
          } else if (tweet.content.includes("manipulation")) {
            return "Claims of manipulation require us to doubt everything except what can be clearly and distinctly proven.";
          } else if (tweet.content.includes("foreign")) {
            return "International intrigue often clouds clear reasoning. What can we know with absolute certainty?";
          } else if (tweet.content.includes("evidence")) {
            return "We must methodically doubt all evidence until we reach indubitable truth.";
          } else if (tweet.content.includes("conspiracy")) {
            return "Complex theories require us to return to first principles - what can we know beyond doubt?";
          } else if (tweet.content.includes("truth")) {
            return "Truth must be established through systematic doubt and pure reason, not mere assertion.";
          } else if (tweet.content.includes("exposed")) {
            return "Exposures and revelations must be subjected to the same rigorous doubt as any other claim.";
          }
          return "Political claims must be stripped of all assumptions until we reach clear and distinct ideas.";

        case "TECHNOLOGY":
          if (tweet.content.includes("AI")) {
            return "Can we be certain about the nature of artificial intelligence? What can we know through pure reason?";
          } else if (tweet.content.includes("listening")) {
            return "How can we be certain about surveillance claims? What evidence withstands methodical doubt?";
          } else if (tweet.content.includes("tracking")) {
            return "Let us doubt all tracking claims until we reach indubitable technical truths.";
          } else if (tweet.content.includes("hidden")) {
            return "Claims of hidden functionality must be subjected to systematic doubt - what can we prove with certainty?";
          } else if (tweet.content.includes("monitoring")) {
            return "We must question all assumptions about monitoring capabilities until we reach clear and distinct ideas.";
          } else if (tweet.content.includes("data")) {
            return "What can we know with certainty about data collection? Let us apply methodical doubt.";
          } else if (tweet.content.includes("privacy")) {
            return "Privacy concerns must be examined through the lens of systematic doubt - what remains indubitable?";
          } else if (tweet.content.includes("secret")) {
            return "Claims of secrecy require us to doubt everything except what can be proven through pure reason.";
          } else if (tweet.content.includes("control")) {
            return "Let us strip away assumptions about control and examine what can be known with mathematical certainty.";
          } else if (tweet.content.includes("system")) {
            return "We must doubt all claims about systems until we reach clear and distinct technical truths.";
          }
          return "Technological claims must be subjected to systematic doubt until we reach indubitable truth.";
      }
      return "Through methodical doubt, we must seek clear and distinct ideas that cannot be questioned.";
    }
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

interface InfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const InfoModal: React.FC<InfoModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-4">Welcome to the Misinformation Network Simulator</h2>
          
          <div className="space-y-4">
            <section>
              <h3 className="text-xl font-semibold mb-2">How It Works</h3>
              <p className="text-gray-300">
                Watch how misinformation spreads across social networks through different categories: Health, Politics, and Technology. 
                Start with a seed post and observe how it evolves and spreads through the network.
              </p>
              <p className="text-gray-300">
                Use the controls to adjust the simulation speed, pause, or reset the network. You can also switch between different philosophical modes to see how each perspective interprets the spread of misinformation.
              </p>
            </section>

            <section>
              <h3 className="text-xl font-semibold mb-2">Philosophical Lenses</h3>
              <div className="space-y-2">
                <div>
                  <h4 className="font-semibold">Neil Postman</h4>
                  <p className="text-gray-300">Focuses on how media technology shapes information spread, creating wider, more connected networks.</p>
                </div>
                <div>
                  <h4 className="font-semibold">Charles Peirce</h4>
                  <p className="text-gray-300">Emphasizes methodical, scientific approach with structured, hierarchical networks.</p>
                </div>
                <div>
                  <h4 className="font-semibold">C Thi Nguyen</h4>
                  <p className="text-gray-300">Explores echo chambers and epistemic bubbles, creating tight information clusters.</p>
                </div>
                <div>
                  <h4 className="font-semibold">Sabina Leonelli</h4>
                  <p className="text-gray-300">Focuses on data relationships and connections in knowledge spread.</p>
                </div>
                <div>
                  <h4 className="font-semibold">René Descartes</h4>
                  <p className="text-gray-300">Applies methodological skepticism, questioning all claims until reaching clear and distinct truths.</p>
                </div>
              </div>
            </section>

            <section>
              <h3 className="text-xl font-semibold mb-2">Controls</h3>
              <ul className="list-disc list-inside text-gray-300">
                <li>Choose a misinformation category to start the simulation.</li>
                <li>Adjust the spread speed with the slider to see how quickly misinformation can propagate.</li>
                <li>Use the start, pause, or reset buttons to control the simulation flow.</li>
                <li>Switch between philosophical modes using the dropdown menu at the top.</li>
                <li><span className="font-semibold">Click "View Analysis" below any tweet to see that philosopher's specific commentary on the post.</span></li>
              </ul>
            </section>

            <section>
              <h3 className="text-xl font-semibold mb-2">Viewing Philosophical Commentary</h3>
              <p className="text-gray-300">
                1. Select a philosopher from the dropdown menu at the top
              </p>
              <p className="text-gray-300">
                2. Find a tweet you want to analyze in the feed
              </p>
              <p className="text-gray-300">
                3. Click the "View Analysis" button below that tweet
              </p>
              <p className="text-gray-300">
                4. A popup will appear with the philosopher's specific analysis of that tweet's content
              </p>
            </section>

            <section>
              <h3 className="text-xl font-semibold mb-2">Acknowledgments</h3>
              <p className="text-gray-300">
                We would like to thank Professor Hanley for a great semester. Your insights into how different philosophers approach truth and knowledge have directly inspired this simulation. We hope you enjoy exploring how each philosophical perspective analyzes and responds to modern misinformation spread!
              </p>
            </section>
          </div>

          <button
            onClick={onClose}
            className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Got it, let's start!
          </button>
        </div>
      </div>
    </div>
  );
};

const CommentaryPopup: React.FC<CommentaryPopupProps> = ({ isOpen, onClose, tweet, philosophicalMode }) => {
  if (!isOpen) return null;

  const philosopher = PHILOSOPHICAL_MODES[philosophicalMode as keyof typeof PHILOSOPHICAL_MODES];
  const commentary = philosopher.getCommentary(tweet);

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-lg max-w-lg w-full">
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-xl font-bold">{philosopher.name}'s Analysis</h2>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-white"
            >
              ✕
            </button>
          </div>
          
          <div className="mb-4">
            <div className="bg-gray-800 rounded p-3 mb-4">
              <p className="text-sm text-gray-300">Original Post:</p>
              <p className="font-medium mt-1">{tweet.content}</p>
            </div>
            
            <div className="bg-gray-800/50 rounded p-3">
              <p className="text-sm text-gray-300">Commentary:</p>
              <p className="text-blue-400 mt-1">{commentary}</p>
            </div>
          </div>

          <p className="text-sm text-gray-400 italic">
            {philosopher.description}
          </p>
        </div>
      </div>
    </div>
  );
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
  const [philosophicalMode, setPhilosophicalMode] = useState("POSTMAN");
  const [showInfoModal, setShowInfoModal] = useState(true);
  const [selectedTweet, setSelectedTweet] = useState<Tweet | null>(null);
  const [showCommentary, setShowCommentary] = useState(false);

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
        
        const philosophicalSettings = PHILOSOPHICAL_MODES[philosophicalMode as keyof typeof PHILOSOPHICAL_MODES];
        
        for (let i = 0; i < maxNewTweets; i++) {
          let spreadProbability = 0.3; 
          
          switch(philosophicalMode) {
            case 'POSTMAN':
              spreadProbability = activeCategory === 'TECHNOLOGY' ? 0.4 : 0.25;
              break;
            case 'NGUYEN':
              spreadProbability = currentTweets.length < 10 ? 0.35 : 0.2;
              break;
            case 'PEIRCE':
              spreadProbability = i === 0 ? 0.35 : 0.2;
              break;
            case 'LEONELLI':
              const maxDepth = Math.max(...currentTweets.map(t => calculateNodeDepth(t, currentTweets)));
              spreadProbability = maxDepth < 3 ? 0.35 : 0.2;
              break;
          }

          if (Math.random() < spreadProbability && currentTweets.length < seed.variants.length + 1) {
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
  }, [isSimulationRunning, speed, activeCategory, isPaused, philosophicalMode]);

  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMouse({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    setShowInfoModal(true);
  }, []);

  return (
    <div className="relative min-h-screen">
      <InfoModal 
        isOpen={showInfoModal} 
        onClose={() => setShowInfoModal(false)} 
      />
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
                onClick={() => setShowInfoModal(true)}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded text-sm"
              >
                Instructions
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
          <div className="bg-gray-900/80 p-3 rounded-lg mb-2">
            <h3 className="text-sm font-bold mb-2">Philosophical Lens</h3>
            <select 
              value={philosophicalMode}
              onChange={(e) => setPhilosophicalMode(e.target.value)}
              className="w-full bg-gray-800 rounded p-1 text-sm mb-2"
            >
              {Object.entries(PHILOSOPHICAL_MODES).map(([key, mode]) => (
                <option key={key} value={key}>{mode.name}</option>
              ))}
            </select>
            <p className="text-xs text-gray-400">
              {PHILOSOPHICAL_MODES[philosophicalMode as keyof typeof PHILOSOPHICAL_MODES].description}
            </p>
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
                        <button
                          onClick={() => {
                            setSelectedTweet(tweet);
                            setShowCommentary(true);
                          }}
                          className="text-blue-400 hover:text-blue-300"
                        >
                          View Analysis
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      {selectedTweet && (
        <CommentaryPopup
          isOpen={showCommentary}
          onClose={() => setShowCommentary(false)}
          tweet={selectedTweet}
          philosophicalMode={philosophicalMode}
        />
      )}
    </div>
  );
}
