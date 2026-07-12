import { useState } from 'react';
import { useStore } from '../context/StoreContext';

interface RewardItem {
  id: string;
  name: string;
  points: number;
  description: string;
  image: string;
  claimed?: boolean;
}

const REWARDS: RewardItem[] = [
  { id: 'reward-juice', name: 'Free Fresh Juice', points: 400, description: 'Quench your thirst with any cold juice flavor.', image: '/kwagavo/juice.jpg' },
  { id: 'reward-fries', name: 'Free Plain Fries', points: 600, description: 'Hot, crispy double-fried potato chips.', image: '/kwagavo/fries.jpg' },
  { id: 'reward-wrap', name: 'Free Chicken Wrap Deluxe', points: 1000, description: 'A warm toasted wrap packed with grilled chicken.', image: '/kwagavo/wrap.jpg' },
  { id: 'reward-burger', name: 'Free Gavo Street Burger', points: 2000, description: 'Our signature juicy burger with caramelized onions.', image: '/kwagavo/burger.jpg' },
];

function generateUniqueCode() {
  return `KG-${Math.floor(100000 + Math.random() * 900000)}`;
}

export default function LoyaltyView() {
  const { loyaltyPoints, loyaltyTier, streakDays } = useStore();
  const [rewardsList, setRewardsList] = useState<RewardItem[]>(REWARDS);
  const [claimedCode, setClaimedCode] = useState<string | null>(null);

  // Constants for points tiers
  const tierMaxPoints = 2500;
  const progressPercent = Math.min(100, (loyaltyPoints / tierMaxPoints) * 100);

  const claimReward = (reward: RewardItem) => {
    if (loyaltyPoints < reward.points) return;
    setRewardsList(prev => prev.map(r => r.id === reward.id ? { ...r, claimed: true } : r));
    // Simulate generation of code
    const uniqueCode = generateUniqueCode();
    setClaimedCode(uniqueCode);
  };

  return (
    <main className="loyalty-view app-view app-view--inset fade-in-up">
      {/* Header */}
      <div className="loyalty-header" style={{ marginBottom: '24px' }}>
        <h1 className="font-headline-lg-mobile shimmer-text" style={{ color: 'var(--color-on-surface)' }}>Gavo Rewards</h1>
        <p className="font-label-md" style={{ color: 'var(--color-on-surface-variant)', marginTop: '4px' }}>Earn and unlock exclusive Gavo perks</p>
      </div>

      {/* Tier Card */}
      <div className="tier-card glass-panel" style={{ 
        background: 'linear-gradient(135deg, var(--color-primary-container) 0%, rgba(90, 20, 45, 0.4) 100%)', 
        borderRadius: 'var(--radius-card)', 
        padding: '24px', 
        border: '1px solid rgba(200, 150, 168, 0.2)',
        boxShadow: 'var(--shadow-primary)',
        position: 'relative',
        overflow: 'hidden',
        marginBottom: '24px'
      }}>
        {/* Decorative elements */}
        <div style={{ position: 'absolute', right: '-20px', top: '-20px', width: '120px', height: '120px', borderRadius: '50%', background: 'var(--color-tertiary)', opacity: 0.15, filter: 'blur(30px)' }} />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
          <div>
            <span className="badge badge--gold" style={{ fontSize: '10px', marginBottom: '8px' }}>🔥 {streakDays}-day streak</span>
            <h2 className="font-headline-xl" style={{ color: '#fff', fontSize: '28px', fontStyle: 'italic', letterSpacing: '0.04em' }}>{loyaltyTier}</h2>
          </div>
          <span className="material-symbols-outlined fill-1" style={{ color: 'var(--color-tertiary)', fontSize: '48px', filter: 'drop-shadow(0 0 10px rgba(200, 150, 168, 0.4))' }}>workspace_premium</span>
        </div>

        {/* Progress bar */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span className="font-label-md" style={{ color: 'var(--color-on-primary-container)' }}>{loyaltyPoints} / {tierMaxPoints} Points</span>
            <span className="font-label-md" style={{ color: 'var(--color-tertiary-fixed-dim)' }}>Next: Gavo Boss</span>
          </div>
          <div style={{ width: '100%', height: '10px', background: 'rgba(255,255,255,0.1)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
            <div style={{ width: `${progressPercent}%`, height: '100%', background: 'linear-gradient(90deg, var(--color-primary) 0%, var(--color-tertiary) 100%)', borderRadius: 'var(--radius-full)', transition: 'width 1s cubic-bezier(0.4, 0, 0.2, 1)' }} />
          </div>
        </div>
      </div>

      {/* Claimed Code Modal/Notification */}
      {claimedCode && (
        <div className="glass-panel" style={{ 
          background: 'var(--color-secondary-fixed)', 
          color: 'var(--color-on-secondary-fixed)',
          borderRadius: 'var(--radius-card)', 
          padding: '20px', 
          marginBottom: '24px', 
          border: '2px dashed var(--color-tertiary)',
          textAlign: 'center',
          position: 'relative'
        }}>
          <button onClick={() => setClaimedCode(null)} style={{ position: 'absolute', right: '12px', top: '12px', background: 'transparent', border: 'none', color: 'var(--color-on-surface-variant)' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>close</span>
          </button>
          <span className="material-symbols-outlined" style={{ color: 'var(--color-tertiary)', fontSize: '36px', marginBottom: '8px' }}>celebration</span>
          <h3 className="font-headline-md" style={{ marginBottom: '4px' }}>Reward Code Generated!</h3>
          <p className="font-body-md" style={{ opacity: 0.8, marginBottom: '16px' }}>Present this at the counter or apply at checkout</p>
          <div style={{ background: '#1c1b1a', color: 'var(--color-tertiary)', padding: '12px 24px', borderRadius: 'var(--radius-xl)', fontSize: '22px', fontWeight: 'bold', letterSpacing: '0.15em', display: 'inline-block', border: '1px solid rgba(255,177,196,0.3)' }}>
            {claimedCode}
          </div>
        </div>
      )}

      {/* Rewards Catalog */}
      <h3 className="font-headline-md" style={{ color: 'var(--color-on-surface)', marginBottom: '16px' }}>Unlockable Perks</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {rewardsList.map(reward => {
          const isEligible = loyaltyPoints >= reward.points && !reward.claimed;
          return (
            <div key={reward.id} className="glass-panel" style={{ 
              display: 'flex', 
              padding: '12px', 
              borderRadius: 'var(--radius-card)', 
              alignItems: 'center', 
              gap: '16px',
              border: reward.claimed ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(200, 150, 168, 0.1)',
              opacity: reward.claimed ? 0.6 : 1,
              transition: 'all 0.3s ease'
            }}>
              <div style={{ width: '64px', height: '64px', borderRadius: 'var(--radius-xl)', overflow: 'hidden', flexShrink: 0 }}>
                <img src={reward.image} alt={reward.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <h4 className="font-headline-md" style={{ fontSize: '16px', color: 'var(--color-on-surface)' }}>{reward.name}</h4>
                <p className="font-body-md" style={{ color: 'var(--color-on-surface-variant)', fontSize: '12px', marginTop: '2px' }}>{reward.description}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '6px' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '14px', color: 'var(--color-tertiary)' }}>workspace_premium</span>
                  <span className="font-label-md" style={{ color: 'var(--color-tertiary)', fontSize: '12px' }}>{reward.points} pts</span>
                </div>
              </div>
              <div>
                {reward.claimed ? (
                  <span className="badge badge--ghost" style={{ background: 'rgba(200, 150, 168, 0.1)', color: 'var(--color-primary-fixed-dim)' }}>Claimed</span>
                ) : (
                  <button 
                    disabled={!isEligible}
                    onClick={() => claimReward(reward)}
                    className="ripple-btn"
                    style={{ 
                      padding: '8px 16px', 
                      borderRadius: 'var(--radius-full)', 
                      background: isEligible ? 'var(--color-tertiary-fixed)' : 'rgba(255,255,255,0.05)', 
                      color: isEligible ? 'var(--color-on-tertiary-fixed)' : 'var(--color-on-surface-variant)',
                      border: 'none',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      cursor: isEligible ? 'pointer' : 'not-allowed',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    Claim
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </main>
  );
}

