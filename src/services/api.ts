import {
  User,
  SessionRequest,
  Review,
  NotificationItem,
  ReciprocalMatch,
  SessionStatus,
  TeachSkill,
  LearnSkill,
} from '../types/index';
import { supabase } from '../../lib/supabase';

// Helper to map DB profile row + skills to User entity
function mapProfileToUser(profile: any, skills: any[]): User {
  const teachSkills: TeachSkill[] = skills
    .filter((s) => s.kind === 'teach')
    .map((s) => ({
      id: s.id,
      name: s.name,
      category: s.category || 'Engineering & Code',
      proficiency: s.proficiency || 'Intermediate',
      yearsExperience: s.years_experience || 2,
      description: s.description || '',
    }));

  const learnSkills: LearnSkill[] = skills
    .filter((s) => s.kind === 'learn')
    .map((s) => ({
      id: s.id,
      name: s.name,
      category: s.category || 'Design & UX',
      priority: s.priority || 'Medium',
      currentLevel: s.current_level || 'Beginner',
      learningGoal: s.learning_goal || '',
    }));

  return {
    id: profile.id,
    name: profile.name || 'Member',
    email: profile.email || '',
    avatar: profile.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(profile.name || 'member')}`,
    headline: profile.headline || 'SkillSwap Member',
    bio: profile.bio || '',
    location: profile.location || 'India',
    interests: Array.isArray(profile.interests) ? profile.interests : [],
    teachSkills,
    learnSkills,
    availability: profile.availability && typeof profile.availability === 'object'
      ? profile.availability
      : {
          summary: 'Weekday evenings (7:00 PM – 9:30 PM IST), Sunday mornings',
          days: ['Tuesday', 'Thursday', 'Sunday'],
          timeSlots: ['7:00 PM', '8:30 PM', '10:00 AM'],
        },
    visibility: profile.visibility || 'public',
    rating: Number(profile.rating) || 5.0,
    reviewCount: Number(profile.review_count) || 0,
    sessionsCompleted: Number(profile.sessions_completed) || 0,
    hoursSwapped: Number(profile.hours_swapped) || 0,
    joinedDate: profile.created_at ? new Date(profile.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'Recently',
  };
}

// Helper to map DB session row with joined sender/receiver to SessionRequest entity
function mapDbSessionToSessionRequest(row: any): SessionRequest {
  return {
    id: row.id,
    senderId: row.sender_id,
    senderName: row.sender?.name || 'SkillSwap Member',
    senderAvatar: row.sender?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${row.sender_id}`,
    receiverId: row.receiver_id,
    receiverName: row.receiver?.name || 'SkillSwap Member',
    receiverAvatar: row.receiver?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${row.receiver_id}`,
    teachSkillName: row.teach_skill_name,
    learnSkillName: row.learn_skill_name,
    proposedDate: row.proposed_date,
    proposedTime: row.proposed_time,
    durationMinutes: Number(row.duration_minutes) || 60,
    format: row.format || 'online',
    locationOrLink: row.location_or_link || 'https://meet.google.com/skillswap-room',
    note: row.note || '',
    status: row.status as SessionStatus,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    rescheduleHistory: Array.isArray(row.reschedule_history) ? row.reschedule_history : [],
    reviewId: row.review_id || undefined,
  };
}

// Helper to map DB review row with joined author to Review entity
function mapDbReviewToReview(row: any): Review {
  return {
    id: row.id,
    sessionId: row.session_id,
    authorId: row.reviewer_id,
    authorName: row.author?.name || 'SkillSwap Member',
    authorAvatar: row.author?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${row.reviewer_id}`,
    authorHeadline: row.author?.headline || '',
    recipientId: row.reviewee_id,
    rating: Number(row.rating) || 5,
    feedback: row.feedback || '',
    skillExchanged: row.skill_exchanged || '',
    createdAt: row.created_at ? new Date(row.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recently',
  };
}

// Compute reciprocal matches dynamically between current user and other members from Supabase
export function calculateReciprocalMatches(
  currentUser: User,
  allMembers: User[]
): ReciprocalMatch[] {
  return allMembers
    .filter((m) => m.id !== currentUser.id && m.visibility !== 'paused')
    .map((member) => {
      // Skills you teach that this member wants to learn
      const youTeach = currentUser.teachSkills
        .filter((userTeach) =>
          member.learnSkills.some(
            (mLearn) =>
              mLearn.name.toLowerCase().includes(userTeach.name.toLowerCase()) ||
              userTeach.name.toLowerCase().includes(mLearn.name.toLowerCase())
          )
        )
        .map((s) => s.name);

      // Skills this member teaches that you want to learn
      const theyTeach = member.teachSkills
        .filter((mTeach) =>
          currentUser.learnSkills.some(
            (uLearn) =>
              uLearn.name.toLowerCase().includes(mTeach.name.toLowerCase()) ||
              mTeach.name.toLowerCase().includes(uLearn.name.toLowerCase())
          )
        )
        .map((s) => s.name);

      let score = 65;
      let reason = 'General learning interest in complementary skill areas.';

      if (youTeach.length > 0 && theyTeach.length > 0) {
        score = 95 + Math.min(youTeach.length + theyTeach.length, 4);
        if (score > 99) score = 99;
        reason = `Direct 2-way exchange: You can teach ${youTeach[0]}, and ${member.name.split(' ')[0]} can teach you ${theyTeach[0]}.`;
      } else if (theyTeach.length > 0) {
        score = 84;
        reason = `${member.name.split(' ')[0]} teaches ${theyTeach[0]} which is on your wishlist.`;
      } else if (youTeach.length > 0) {
        score = 80;
        reason = `You can teach ${youTeach[0]} which ${member.name.split(' ')[0]} wants to learn.`;
      }

      return {
        member,
        youTeach,
        theyTeach,
        compatibilityScore: score,
        compatibilityReason: reason,
      };
    })
    .sort((a, b) => b.compatibilityScore - a.compatibilityScore);
}

/**
 * 100% Native Supabase API client for SkillSwap.
 * No dummy backend or local mocks — all operations query Supabase directly.
 */
export const api = {
  auth: {
    async getCurrentUser(): Promise<User | null> {
      if (!supabase) return null;
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return null;

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      const { data: skills } = await supabase
        .from('skills')
        .select('*')
        .eq('user_id', user.id);

      if (!profile) {
        return {
          id: user.id,
          name: user.user_metadata?.name || user.email?.split('@')[0] || 'Member',
          email: user.email || '',
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`,
          headline: 'SkillSwap Member',
          bio: '',
          location: 'India',
          interests: [],
          teachSkills: [],
          learnSkills: [],
          availability: {
            summary: 'Flexible schedule',
            days: ['Tuesday', 'Thursday'],
            timeSlots: ['7:00 PM'],
          },
          visibility: 'public',
          rating: 5.0,
          reviewCount: 0,
          sessionsCompleted: 0,
          hoursSwapped: 0,
          joinedDate: 'Recently',
        };
      }

      return mapProfileToUser(profile, skills || []);
    },

    async login(email: string, password?: string): Promise<User> {
      if (!supabase) {
        throw new Error('Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.');
      }
      if (!password) throw new Error('Password is required.');

      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (error) throw error;

      const user = await this.getCurrentUser();
      if (!user) throw new Error('Signed in, but profile could not be loaded.');
      return user;
    },

    async signup(data: Partial<User> & { email: string; name: string; password: string }): Promise<User> {
      if (!supabase) {
        throw new Error('Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.');
      }
      if (data.password.length < 6) throw new Error('Password must be at least 6 characters.');

      const { data: result, error } = await supabase.auth.signUp({
        email: data.email.trim(),
        password: data.password,
        options: {
          data: { name: data.name.trim() },
        },
      });
      if (error) throw error;
      if (!result.user) throw new Error('Signup did not return a user.');

      // Update additional profile info
      await supabase
        .from('profiles')
        .update({
          name: data.name.trim(),
          headline: data.headline || 'SkillSwap Community Member',
          bio: data.bio || 'Excited to exchange knowledge and collaborate with peers on SkillSwap!',
          location: data.location || 'India',
          interests: data.interests || [],
        })
        .eq('id', result.user.id);

      // If initial skills were provided during signup, insert them
      if (data.teachSkills && data.teachSkills.length > 0) {
        for (const s of data.teachSkills) {
          await supabase.from('skills').insert({
            user_id: result.user.id,
            kind: 'teach',
            name: s.name,
            category: s.category || 'Engineering & Code',
            proficiency: s.proficiency || 'Intermediate',
            description: s.description || '',
          });
        }
      }
      if (data.learnSkills && data.learnSkills.length > 0) {
        for (const s of data.learnSkills) {
          await supabase.from('skills').insert({
            user_id: result.user.id,
            kind: 'learn',
            name: s.name,
            category: s.category || 'Design & UX',
            priority: s.priority || 'High',
            learning_goal: s.learningGoal || '',
          });
        }
      }

      const user = await this.getCurrentUser();
      if (!user) throw new Error('Account created, but profile could not be loaded.');
      return user;
    },

    async logout(): Promise<void> {
      if (supabase) {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
      }
    },
  },

  profile: {
    async update(updates: Partial<User>): Promise<User> {
      if (!supabase) throw new Error('Supabase client not initialized');
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const updatePayload: Record<string, any> = {
        updated_at: new Date().toISOString(),
      };
      if (updates.name !== undefined) updatePayload.name = updates.name;
      if (updates.headline !== undefined) updatePayload.headline = updates.headline;
      if (updates.bio !== undefined) updatePayload.bio = updates.bio;
      if (updates.location !== undefined) updatePayload.location = updates.location;
      if (updates.avatar !== undefined) updatePayload.avatar = updates.avatar;
      if (updates.visibility !== undefined) updatePayload.visibility = updates.visibility;
      if (updates.interests !== undefined) updatePayload.interests = updates.interests;
      if (updates.availability !== undefined) updatePayload.availability = updates.availability;

      const { error } = await supabase.from('profiles').update(updatePayload).eq('id', user.id);
      if (error) throw error;

      const updated = await api.auth.getCurrentUser();
      if (!updated) throw new Error('Failed to reload updated profile');
      return updated;
    },

    async addTeachSkill(skill: Omit<TeachSkill, 'id'>): Promise<User> {
      if (!supabase) throw new Error('Supabase client not initialized');
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase.from('skills').insert({
        user_id: user.id,
        kind: 'teach',
        name: skill.name,
        category: skill.category,
        proficiency: skill.proficiency,
        years_experience: skill.yearsExperience || 2,
        description: skill.description || '',
      });
      if (error) throw error;

      return (await api.auth.getCurrentUser())!;
    },

    async removeTeachSkill(skillId: string): Promise<User> {
      if (!supabase) throw new Error('Supabase client not initialized');
      const { error } = await supabase.from('skills').delete().eq('id', skillId);
      if (error) throw error;

      return (await api.auth.getCurrentUser())!;
    },

    async addLearnSkill(skill: Omit<LearnSkill, 'id'>): Promise<User> {
      if (!supabase) throw new Error('Supabase client not initialized');
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase.from('skills').insert({
        user_id: user.id,
        kind: 'learn',
        name: skill.name,
        category: skill.category,
        priority: skill.priority,
        current_level: skill.currentLevel || 'Beginner',
        learning_goal: skill.learningGoal || '',
      });
      if (error) throw error;

      return (await api.auth.getCurrentUser())!;
    },

    async removeLearnSkill(skillId: string): Promise<User> {
      if (!supabase) throw new Error('Supabase client not initialized');
      const { error } = await supabase.from('skills').delete().eq('id', skillId);
      if (error) throw error;

      return (await api.auth.getCurrentUser())!;
    },
  },

  members: {
    async getAll(): Promise<User[]> {
      if (!supabase) return [];

      const { data: profiles, error: pError } = await supabase
        .from('profiles')
        .select('*')
        .neq('visibility', 'paused')
        .order('name');

      if (pError || !profiles) return [];

      const { data: skills } = await supabase.from('skills').select('*');
      const allSkills = skills || [];

      return profiles.map((p) =>
        mapProfileToUser(
          p,
          allSkills.filter((s) => s.user_id === p.id)
        )
      );
    },

    async getById(id: string): Promise<User | null> {
      if (!supabase) return null;

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (!profile) return null;

      const { data: skills } = await supabase
        .from('skills')
        .select('*')
        .eq('user_id', id);

      return mapProfileToUser(profile, skills || []);
    },

    async getMatches(currentUser: User): Promise<ReciprocalMatch[]> {
      const allMembers = await api.members.getAll();
      return calculateReciprocalMatches(currentUser, allMembers);
    },
  },

  sessions: {
    async getAll(): Promise<SessionRequest[]> {
      if (!supabase) return [];
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return [];

      const { data: sessions, error } = await supabase
        .from('sessions')
        .select(`
          *,
          sender:profiles!sender_id(id, name, avatar),
          receiver:profiles!receiver_id(id, name, avatar)
        `)
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (error || !sessions) {
        console.error('Error fetching sessions:', error);
        return [];
      }

      return sessions.map(mapDbSessionToSessionRequest);
    },

    async create(request: {
      receiverId: string;
      teachSkillName: string;
      learnSkillName: string;
      proposedDate: string;
      proposedTime: string;
      durationMinutes: number;
      format: 'online' | 'in_person';
      locationOrLink?: string;
      note: string;
    }): Promise<SessionRequest> {
      if (!supabase) throw new Error('Supabase client not initialized');
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('sessions')
        .insert({
          sender_id: user.id,
          receiver_id: request.receiverId,
          teach_skill_name: request.teachSkillName,
          learn_skill_name: request.learnSkillName,
          proposed_date: request.proposedDate,
          proposed_time: request.proposedTime,
          duration_minutes: request.durationMinutes,
          format: request.format,
          location_or_link: request.locationOrLink || 'https://meet.google.com/skillswap-room',
          note: request.note,
          status: 'pending',
        })
        .select(`
          *,
          sender:profiles!sender_id(id, name, avatar),
          receiver:profiles!receiver_id(id, name, avatar)
        `)
        .single();

      if (error || !data) {
        throw error || new Error('Failed to create session request');
      }

      // Notify the receiver in Supabase
      await supabase.from('notifications').insert({
        user_id: request.receiverId,
        title: 'New Exchange Request',
        message: `${data.sender?.name || 'A peer'} proposed a 1:1 session swapping ${request.teachSkillName} for ${request.learnSkillName}.`,
        type: 'session_request',
        related_session_id: data.id,
        related_member_id: user.id,
      });

      return mapDbSessionToSessionRequest(data);
    },

    async updateStatus(
      sessionId: string,
      status: SessionStatus,
      rescheduleDetails?: { proposedDate: string; proposedTime: string; note?: string }
    ): Promise<SessionRequest> {
      if (!supabase) throw new Error('Supabase client not initialized');
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: current } = await supabase
        .from('sessions')
        .select('*')
        .eq('id', sessionId)
        .single();

      if (!current) throw new Error('Session not found');

      const updatePayload: Record<string, any> = {
        status,
        updated_at: new Date().toISOString(),
      };

      if (rescheduleDetails?.proposedDate) updatePayload.proposed_date = rescheduleDetails.proposedDate;
      if (rescheduleDetails?.proposedTime) updatePayload.proposed_time = rescheduleDetails.proposedTime;
      if (rescheduleDetails?.note) updatePayload.note = rescheduleDetails.note;

      if (rescheduleDetails) {
        const history = Array.isArray(current.reschedule_history) ? current.reschedule_history : [];
        updatePayload.reschedule_history = [
          ...history,
          {
            proposedBy: user.id,
            proposedDate: rescheduleDetails.proposedDate,
            proposedTime: rescheduleDetails.proposedTime,
            note: rescheduleDetails.note || '',
            timestamp: new Date().toISOString(),
          },
        ];
      }

      const { data, error } = await supabase
        .from('sessions')
        .update(updatePayload)
        .eq('id', sessionId)
        .select(`
          *,
          sender:profiles!sender_id(id, name, avatar),
          receiver:profiles!receiver_id(id, name, avatar)
        `)
        .single();

      if (error || !data) throw error || new Error('Failed to update session status');

      // Send notification to the opposite participant
      const targetUserId = user.id === current.sender_id ? current.receiver_id : current.sender_id;
      let notifTitle = 'Session Update';
      let notifMsg = `Your session status was updated to ${status}.`;
      let notifType = 'session_request';

      if (status === 'confirmed') {
        notifTitle = 'Session Confirmed';
        notifMsg = `${user.id === current.sender_id ? data.sender?.name : data.receiver?.name} confirmed your session!`;
        notifType = 'request_accepted';
      } else if (status === 'declined') {
        notifTitle = 'Session Declined';
        notifMsg = 'Your session request was declined.';
        notifType = 'request_declined';
      } else if (status === 'rescheduled') {
        notifTitle = 'Session Rescheduled';
        notifMsg = 'A new date/time was proposed for your session.';
        notifType = 'session_rescheduled';
      } else if (status === 'completed') {
        notifTitle = 'Session Completed';
        notifMsg = 'Your session has been marked completed! Leave feedback for your peer.';
        notifType = 'session_completed';
      }

      await supabase.from('notifications').insert({
        user_id: targetUserId,
        title: notifTitle,
        message: notifMsg,
        type: notifType,
        related_session_id: sessionId,
        related_member_id: user.id,
      });

      return mapDbSessionToSessionRequest(data);
    },
  },

  reviews: {
    async getForMember(memberId: string): Promise<Review[]> {
      if (!supabase) return [];

      const { data: reviews, error } = await supabase
        .from('reviews')
        .select(`
          *,
          author:profiles!reviewer_id(id, name, avatar, headline)
        `)
        .eq('reviewee_id', memberId)
        .order('created_at', { ascending: false });

      if (error || !reviews) {
        console.error('Error fetching reviews:', error);
        return [];
      }

      return reviews.map(mapDbReviewToReview);
    },

    async submit(data: {
      sessionId: string;
      recipientId: string;
      rating: number;
      feedback: string;
      skillExchanged: string;
    }): Promise<Review> {
      if (!supabase) throw new Error('Supabase client not initialized');
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: review, error } = await supabase
        .from('reviews')
        .insert({
          session_id: data.sessionId,
          reviewer_id: user.id,
          reviewee_id: data.recipientId,
          rating: data.rating,
          feedback: data.feedback,
          skill_exchanged: data.skillExchanged,
        })
        .select(`
          *,
          author:profiles!reviewer_id(id, name, avatar, headline)
        `)
        .single();

      if (error || !review) throw error || new Error('Failed to submit review');

      // Link review back to session
      if (data.sessionId) {
        await supabase
          .from('sessions')
          .update({ review_id: review.id })
          .eq('id', data.sessionId);
      }

      // Update recipient's rating aggregates in profiles
      const memberReviews = await api.reviews.getForMember(data.recipientId);
      const avgRating = memberReviews.reduce((sum, r) => sum + r.rating, 0) / (memberReviews.length || 1);

      await supabase
        .from('profiles')
        .update({
          rating: Math.round(avgRating * 10) / 10,
          review_count: memberReviews.length,
        })
        .eq('id', data.recipientId);

      // Notify recipient
      await supabase.from('notifications').insert({
        user_id: data.recipientId,
        title: `New ${data.rating}-Star Review Received`,
        message: `${review.author?.name || 'A peer'} left you a review: "${data.feedback.substring(0, 60)}..."`,
        type: 'review_received',
        related_session_id: data.sessionId,
        related_member_id: user.id,
      });

      return mapDbReviewToReview(review);
    },
  },

  notifications: {
    async getAll(): Promise<NotificationItem[]> {
      if (!supabase) return [];
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error || !data) {
        console.error('Error fetching notifications:', error);
        return [];
      }

      return data.map((n) => ({
        id: n.id,
        userId: n.user_id,
        type: n.type,
        title: n.title,
        message: n.message,
        relatedSessionId: n.related_session_id,
        relatedMemberId: n.related_member_id,
        isRead: n.is_read,
        createdAt: n.created_at,
      }));
    },

    async markAsRead(id: string): Promise<void> {
      if (!supabase) return;
      await supabase.from('notifications').update({ is_read: true }).eq('id', id);
    },

    async markAllAsRead(): Promise<void> {
      if (!supabase) return;
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from('notifications')
          .update({ is_read: true })
          .eq('user_id', user.id);
      }
    },
  },

  demo: {
    reset(): void {
      // No-op in Supabase mode
    },
  },
};
