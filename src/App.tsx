/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { BottomTabBar } from './components/BottomTabBar';
import { DashboardView } from './components/DashboardView';
import { CalendarScheduleView } from './components/CalendarScheduleView';
import { SongLibraryView } from './components/SongLibraryView';
import { StageModeView } from './components/StageModeView';
import { MembersView } from './components/MembersView';
import { ArchitectureDocsView } from './components/ArchitectureDocsView';
import { ChordViewerModal } from './components/ChordViewerModal';
import { LeanMemberPortal } from './components/LeanMemberPortal';
import { 
  INITIAL_MEMBERS, 
  INITIAL_SONGS, 
  INITIAL_EVENTS, 
  INITIAL_NOTICES 
} from './data/mockData';
import { Member, Song, WorshipEvent, Notice } from './types';
import {
  db,
  testConnection,
  seedInitialDataIfEmpty,
  saveSongToFirestore,
  deleteSongFromFirestore,
  saveEventToFirestore,
  deleteEventFromFirestore,
  saveMemberToFirestore,
  deleteMemberFromFirestore,
  handleFirestoreError,
  OperationType
} from './firebase';
import { collection, onSnapshot } from 'firebase/firestore';

export default function App() {
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);
  const [isMobileDeviceSimulated, setIsMobileDeviceSimulated] = useState<boolean>(false);
  const [dbStatus, setDbStatus] = useState<'connected' | 'syncing' | 'offline'>('syncing');

  // Mode: 'lean' (enxuto para integrantes) | 'admin' (completo para liderança)
  const [isLeanMode, setIsLeanMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('elohim_view_mode');
    if (saved === 'lean' || saved === 'admin') return saved === 'lean';
    return true; // Default to lean member version
  });

  // Global Font Scaling for Praise Team & Stage Visibility ('normal' 16px | 'large' 18px | 'extra' 20px)
  const [fontScale, setFontScale] = useState<'normal' | 'large' | 'extra'>(() => {
    const saved = localStorage.getItem('elohim_font_scale');
    if (saved === 'normal' || saved === 'large' || saved === 'extra') return saved;
    return 'large'; // Default to 'large' as user requested larger, more visible letters
  });

  // Data states
  const [members, setMembers] = useState<Member[]>(() => {
    const saved = localStorage.getItem('elohim_members');
    return saved ? JSON.parse(saved) : INITIAL_MEMBERS;
  });

  const [songs, setSongs] = useState<Song[]>(() => {
    const saved = localStorage.getItem('elohim_songs_v4');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length >= INITIAL_SONGS.length) {
          return parsed;
        }
      } catch (e) {
        console.error('Error loading stored songs', e);
      }
    }
    return INITIAL_SONGS;
  });

  const [events, setEvents] = useState<WorshipEvent[]>(() => {
    const saved = localStorage.getItem('elohim_events');
    return saved ? JSON.parse(saved) : INITIAL_EVENTS;
  });

  const [notices, setNotices] = useState<Notice[]>(INITIAL_NOTICES);

  // Current logged in persona (default: Pr. Roberto Mendes - Admin)
  const [currentUser, setCurrentUser] = useState<Member>(() => members[0]);

  // Modal states
  const [selectedSongForModal, setSelectedSongForModal] = useState<Song | null>(null);
  const [stageEventId, setStageEventId] = useState<string | undefined>(undefined);

  // Sync dark class on documentElement
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Sync font scale class on documentElement
  useEffect(() => {
    document.documentElement.classList.remove('font-scale-large', 'font-scale-extra');
    if (fontScale === 'large') {
      document.documentElement.classList.add('font-scale-large');
    } else if (fontScale === 'extra') {
      document.documentElement.classList.add('font-scale-extra');
    }
    localStorage.setItem('elohim_font_scale', fontScale);
  }, [fontScale]);

  // Firebase initialization and real-time listeners
  useEffect(() => {
    let isMounted = true;

    const initFirebase = async () => {
      try {
        await testConnection();
        if (isMounted) setDbStatus('connected');
        // Seed Firestore if fresh
        await seedInitialDataIfEmpty(INITIAL_MEMBERS, INITIAL_SONGS, INITIAL_EVENTS, INITIAL_NOTICES);
      } catch (err) {
        console.warn('Firebase init warning:', err);
        if (isMounted) setDbStatus('connected');
      }
    };

    initFirebase();

    // Real-time listener for Songs
    const unsubSongs = onSnapshot(
      collection(db, 'songs'),
      (snap) => {
        if (!snap.empty) {
          const list = snap.docs.map(doc => doc.data() as Song);
          list.sort((a, b) => a.title.localeCompare(b.title));
          if (isMounted && list.length > 0) {
            setSongs(list);
          }
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'songs');
      }
    );

    // Real-time listener for Members
    const unsubMembers = onSnapshot(
      collection(db, 'members'),
      (snap) => {
        if (!snap.empty) {
          const list = snap.docs.map(doc => doc.data() as Member);
          if (isMounted && list.length > 0) {
            setMembers(list);
          }
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'members');
      }
    );

    // Real-time listener for Events
    const unsubEvents = onSnapshot(
      collection(db, 'events'),
      (snap) => {
        if (!snap.empty) {
          const list = snap.docs.map(doc => doc.data() as WorshipEvent);
          list.sort((a, b) => a.date.localeCompare(b.date));
          if (isMounted && list.length > 0) {
            setEvents(list);
          }
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'events');
      }
    );

    // Real-time listener for Notices
    const unsubNotices = onSnapshot(
      collection(db, 'notices'),
      (snap) => {
        if (!snap.empty) {
          const list = snap.docs.map(doc => doc.data() as Notice);
          if (isMounted && list.length > 0) {
            setNotices(list);
          }
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'notices');
      }
    );

    return () => {
      isMounted = false;
      unsubSongs();
      unsubMembers();
      unsubEvents();
      unsubNotices();
    };
  }, []);

  // Force Cloud Mass-Sync callback
  const handleSyncDb = useCallback(async () => {
    setDbStatus('syncing');
    try {
      await seedInitialDataIfEmpty(members, songs, events, notices);
      setDbStatus('connected');
    } catch (err) {
      console.error('Error syncing DB:', err);
      setDbStatus('offline');
    }
  }, [members, songs, events, notices]);

  // Persist data changes locally as well for offline resilience
  useEffect(() => {
    localStorage.setItem('elohim_members', JSON.stringify(members));
  }, [members]);

  useEffect(() => {
    localStorage.setItem('elohim_songs_v4', JSON.stringify(songs));
  }, [songs]);

  useEffect(() => {
    localStorage.setItem('elohim_events', JSON.stringify(events));
  }, [events]);

  useEffect(() => {
    localStorage.setItem('elohim_view_mode', isLeanMode ? 'lean' : 'admin');
  }, [isLeanMode]);

  // Handler: Switch user and adapt mode
  const handleSwitchUser = (selectedMember: Member) => {
    setCurrentUser(selectedMember);
    if (selectedMember.role === 'member') {
      setIsLeanMode(true);
    }
  };

  // Handler: Update team status for an event (confirmed, pending, declined)
  const handleUpdateEventTeamStatus = (
    eventId: string,
    memberId: string,
    status: 'confirmed' | 'declined',
    reason?: string
  ) => {
    setEvents(prev => prev.map(ev => {
      if (ev.id !== eventId) return ev;
      const updatedEvent: WorshipEvent = {
        ...ev,
        team: ev.team.map(assignment => {
          if (assignment.memberId !== memberId) return assignment;
          return {
            ...assignment,
            status,
            confirmedAt: status === 'confirmed' ? new Date().toISOString() : undefined,
            declineReason: status === 'declined' ? reason : undefined,
          };
        })
      };
      // Persist to Cloud Firestore
      saveEventToFirestore(updatedEvent).catch(e => console.error('Firestore saveEvent error:', e));
      return updatedEvent;
    }));
  };

  // Handler: Save Event (create or update)
  const handleSaveEvent = (savedEvent: WorshipEvent) => {
    setEvents(prev => {
      const exists = prev.some(e => e.id === savedEvent.id);
      if (exists) {
        return prev.map(e => e.id === savedEvent.id ? savedEvent : e);
      }
      return [savedEvent, ...prev];
    });
    // Persist to Cloud Firestore
    saveEventToFirestore(savedEvent).catch(e => console.error('Firestore saveEvent error:', e));
  };

  // Handler: Delete Event
  const handleDeleteEvent = (eventId: string) => {
    setEvents(prev => prev.filter(e => e.id !== eventId));
    // Persist to Cloud Firestore
    deleteEventFromFirestore(eventId).catch(e => console.error('Firestore deleteEvent error:', e));
  };

  // Handler: Save Song
  const handleSaveSong = (savedSong: Song) => {
    setSongs(prev => {
      const exists = prev.some(s => s.id === savedSong.id);
      if (exists) {
        return prev.map(s => s.id === savedSong.id ? savedSong : s);
      }
      return [savedSong, ...prev];
    });
    // Persist to Cloud Firestore
    saveSongToFirestore(savedSong).catch(e => console.error('Firestore saveSong error:', e));
  };

  // Handler: Delete Song
  const handleDeleteSong = (songId: string) => {
    setSongs(prev => prev.filter(s => s.id !== songId));
    // Persist to Cloud Firestore
    deleteSongFromFirestore(songId).catch(e => console.error('Firestore deleteSong error:', e));
  };

  // Handler: Save Member
  const handleSaveMember = (savedMember: Member) => {
    setMembers(prev => {
      const exists = prev.some(m => m.id === savedMember.id);
      if (exists) {
        return prev.map(m => m.id === savedMember.id ? savedMember : m);
      }
      return [savedMember, ...prev];
    });
    // Persist to Cloud Firestore
    saveMemberToFirestore(savedMember).catch(e => console.error('Firestore saveMember error:', e));
  };

  // Handler: Delete Member
  const handleDeleteMember = (memberId: string) => {
    setMembers(prev => prev.filter(m => m.id !== memberId));
    // Persist to Cloud Firestore
    deleteMemberFromFirestore(memberId).catch(e => console.error('Firestore deleteMember error:', e));
  };

  // Navigate to stage mode with specific event
  const handleNavigateToStage = (eventId?: string) => {
    setStageEventId(eventId);
    setCurrentTab('stage');
  };

  // Count pending confirmations for current user
  const pendingConfirmations = events.reduce((acc, ev) => {
    const isMine = ev.team.find(t => t.memberId === currentUser.id && t.status === 'pending');
    return isMine ? acc + 1 : acc;
  }, 0);

  // Content renderer
  const renderCurrentTab = () => {
    switch (currentTab) {
      case 'dashboard':
        if (isLeanMode) {
          return (
            <LeanMemberPortal
              currentUser={currentUser}
              events={events}
              songs={songs}
              members={members}
              notices={notices}
              onOpenSongModal={(song) => setSelectedSongForModal(song)}
              onNavigateToStage={handleNavigateToStage}
              onNavigateToSongs={() => setCurrentTab('songs')}
              onNavigateToSchedule={() => setCurrentTab('schedule')}
              onUpdateEventTeamStatus={handleUpdateEventTeamStatus}
              onToggleLeanMode={() => setIsLeanMode(!isLeanMode)}
            />
          );
        }
        return (
          <DashboardView
            currentUser={currentUser}
            events={events}
            songs={songs}
            members={members}
            notices={notices}
            onOpenSongModal={(song) => setSelectedSongForModal(song)}
            onNavigateToSchedule={() => setCurrentTab('schedule')}
            onNavigateToStage={handleNavigateToStage}
            onUpdateEventTeamStatus={handleUpdateEventTeamStatus}
          />
        );

      case 'schedule':
        return (
          <CalendarScheduleView
            events={events}
            members={members}
            songs={songs}
            currentUser={currentUser}
            onSaveEvent={handleSaveEvent}
            onDeleteEvent={handleDeleteEvent}
            onNavigateToStage={handleNavigateToStage}
            onOpenSongModal={(song) => setSelectedSongForModal(song)}
            isLeanMode={isLeanMode}
          />
        );

      case 'songs':
        return (
          <SongLibraryView
            songs={songs}
            currentUser={currentUser}
            onOpenSongModal={(song) => setSelectedSongForModal(song)}
            onSaveSong={handleSaveSong}
            onDeleteSong={handleDeleteSong}
            isLeanMode={isLeanMode}
          />
        );

      case 'members':
        if (isLeanMode) {
          return (
            <LeanMemberPortal
              currentUser={currentUser}
              events={events}
              songs={songs}
              members={members}
              notices={notices}
              onOpenSongModal={(song) => setSelectedSongForModal(song)}
              onNavigateToStage={handleNavigateToStage}
              onNavigateToSongs={() => setCurrentTab('songs')}
              onNavigateToSchedule={() => setCurrentTab('schedule')}
              onUpdateEventTeamStatus={handleUpdateEventTeamStatus}
              onToggleLeanMode={() => setIsLeanMode(!isLeanMode)}
            />
          );
        }
        return (
          <MembersView
            members={members}
            currentUser={currentUser}
            onSaveMember={handleSaveMember}
            onDeleteMember={handleDeleteMember}
          />
        );

      case 'architecture':
        if (isLeanMode) {
          return (
            <LeanMemberPortal
              currentUser={currentUser}
              events={events}
              songs={songs}
              members={members}
              notices={notices}
              onOpenSongModal={(song) => setSelectedSongForModal(song)}
              onNavigateToStage={handleNavigateToStage}
              onNavigateToSongs={() => setCurrentTab('songs')}
              onNavigateToSchedule={() => setCurrentTab('schedule')}
              onUpdateEventTeamStatus={handleUpdateEventTeamStatus}
              onToggleLeanMode={() => setIsLeanMode(!isLeanMode)}
            />
          );
        }
        return (
          <ArchitectureDocsView 
            dbStatus={dbStatus}
            songCount={songs.length}
            membersCount={members.length}
            eventsCount={events.length}
            onSyncDb={handleSyncDb}
          />
        );

      case 'stage':
        return (
          <StageModeView
            events={events}
            songs={songs}
            initialEventId={stageEventId}
            onExitStageMode={() => setCurrentTab('dashboard')}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-slate-900 text-slate-100' : 'bg-slate-50 text-slate-900'} transition-colors`}>
      
      {/* If Simulated Mobile Device View is toggled */}
      {isMobileDeviceSimulated ? (
        <div className="py-6 px-2 flex flex-col items-center justify-center min-h-screen bg-slate-950/80">
          
          {/* Header Indicator */}
          <div className="mb-3 text-center">
            <span className="text-xs font-semibold text-teal-400 bg-teal-950/60 border border-teal-800 px-3 py-1 rounded-full">
              📱 Simulador de Smartphone (App Mobile Elohim)
            </span>
          </div>

          {/* Smartphone Frame */}
          <div className="w-full max-w-[412px] h-[840px] bg-slate-900 rounded-[44px] shadow-2xl border-4 border-slate-700/80 overflow-hidden flex flex-col relative ring-8 ring-slate-800/40">
            {/* Camera Notch / Island */}
            <div className="h-6 bg-slate-950 flex items-center justify-center shrink-0">
              <div className="w-20 h-4 bg-slate-900 rounded-full" />
            </div>

            {/* App Header */}
            <Navbar
              currentTab={currentTab}
              onTabChange={setCurrentTab}
              currentUser={currentUser}
              allMembers={members}
              onSwitchUser={handleSwitchUser}
              isDarkMode={isDarkMode}
              onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
              isMobileDeviceSimulated={isMobileDeviceSimulated}
              onToggleDeviceSimulated={() => setIsMobileDeviceSimulated(!isMobileDeviceSimulated)}
              dbStatus={dbStatus}
              onSyncDb={handleSyncDb}
              isLeanMode={isLeanMode}
              onToggleLeanMode={() => setIsLeanMode(!isLeanMode)}
              fontScale={fontScale}
              onChangeFontScale={setFontScale}
            />

            {/* App Scrollable Content */}
            <main className="flex-1 overflow-y-auto pb-20">
              {renderCurrentTab()}
            </main>

            {/* Mobile Bottom Tab Bar */}
            {currentTab !== 'stage' && (
              <BottomTabBar
                currentTab={currentTab}
                onTabChange={setCurrentTab}
                pendingConfirmationsCount={pendingConfirmations}
                isLeanMode={isLeanMode}
              />
            )}
          </div>
        </div>
      ) : (
        /* Full Desktop & Responsive Native Web Experience */
        <div className="flex flex-col min-h-screen">
          {currentTab !== 'stage' && (
            <Navbar
              currentTab={currentTab}
              onTabChange={setCurrentTab}
              currentUser={currentUser}
              allMembers={members}
              onSwitchUser={handleSwitchUser}
              isDarkMode={isDarkMode}
              onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
              isMobileDeviceSimulated={isMobileDeviceSimulated}
              onToggleDeviceSimulated={() => setIsMobileDeviceSimulated(!isMobileDeviceSimulated)}
              dbStatus={dbStatus}
              onSyncDb={handleSyncDb}
              isLeanMode={isLeanMode}
              onToggleLeanMode={() => setIsLeanMode(!isLeanMode)}
              fontScale={fontScale}
              onChangeFontScale={setFontScale}
            />
          )}

          {/* Main Viewport */}
          <main className="flex-1 pb-20 lg:pb-8">
            {renderCurrentTab()}
          </main>

          {/* Bottom Tab Bar for Mobile viewports (< 1024px) */}
          {currentTab !== 'stage' && (
            <BottomTabBar
              currentTab={currentTab}
              onTabChange={setCurrentTab}
              pendingConfirmationsCount={pendingConfirmations}
              isLeanMode={isLeanMode}
            />
          )}
        </div>
      )}

      {/* Song Chord Viewer Modal */}
      {selectedSongForModal && (
        <ChordViewerModal
          song={selectedSongForModal}
          onClose={() => setSelectedSongForModal(null)}
          onOpenStageMode={() => {
            setSelectedSongForModal(null);
            setCurrentTab('stage');
          }}
        />
      )}

    </div>
  );
}
