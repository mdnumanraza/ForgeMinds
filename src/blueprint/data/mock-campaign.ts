import type { Campaign } from './types'

// Mock data — Kubernetes Kingdom, Stages 1 and 2
// Mirrors development/game-design/ai-campaign-structure.md

export const KUBERNETES_KINGDOM: Campaign = {
  id: 'kubernetes-kingdom',
  title: 'Kubernetes Kingdom',
  domain: 'Kubernetes',
  acts: [
    {
      id: 'act-1',
      title: 'Act 1 — Fundamentals',
      narrativeTheme: 'Discovery: The kingdom is wounded. Learn what broke.',
      stages: [
        {
          id: 'stage-1',
          title: 'The Hollow Fields',
          conceptRef: 'concept:kubernetes:container',
          levelRange: [1, 3],
          beats: [
            {
              id: 's1-b1',
              position: 1,
              type: 'ARRIVAL',
              payload: {
                title: 'Arrival at the Hollow Fields',
                description: 'The player is summoned to scorched, still farmland. Lyra meets them at the edge, frantic.',
                relatedNPCs: ['Lyra'],
              },
            },
            {
              id: 's1-b2',
              position: 2,
              type: 'EXPLORATION',
              payload: {
                title: 'The Cracked Fields',
                description: 'Explore ruined farmland. Shells everywhere — intact on the outside, empty within.',
                relatedNPCs: ['Bram the Field Warden', 'Fen the Wandering Scribe'],
              },
            },
            {
              id: 's1-b3',
              position: 3,
              type: 'KNOWLEDGE',
              payload: {
                title: 'What a Container Is',
                description: 'A glowing shell-scroll reveals the concept: a portable, self-contained unit of running software.',
                conceptRef: 'concept:kubernetes:container',
                learningGoal: 'Understand what a container is and why isolation matters',
              },
            },
            {
              id: 's1-b4',
              position: 4,
              type: 'KNOWLEDGE',
              payload: {
                title: 'Image vs Running Container',
                description: 'A second scroll: the difference between an image (the blueprint) and a running container (the living thing).',
                conceptRef: 'concept:kubernetes:container',
                learningGoal: 'Distinguish between container image and running container instance',
              },
            },
            {
              id: 's1-b5',
              position: 5,
              type: 'NPC_INTERACTION',
              payload: {
                title: 'Bram Shows the Player',
                description: 'Bram the Field Warden demonstrates which shells are intact vs corrupted before Lyra finishes explaining.',
                relatedNPCs: ['Bram the Field Warden'],
              },
            },
            {
              id: 's1-b6',
              position: 6,
              type: 'QUEST',
              payload: {
                title: 'Identify the Intact Containers',
                description: 'Help Bram identify which shells can be replanted — those with valid images vs hollow decoys.',
                conceptRef: 'concept:kubernetes:container',
                learningGoal: 'Apply container isolation knowledge to distinguish valid from corrupt',
                relatedNPCs: ['Bram the Field Warden'],
                relatedQuests: ['Quest: Replanting the Fields'],
              },
            },
            {
              id: 's1-b7',
              position: 7,
              type: 'ENCOUNTER',
              payload: {
                title: 'Shell Beetles',
                description: 'Corrupted creatures that hollow out container structures. Look right on the outside — nothing runs inside.',
                conceptRef: 'concept:kubernetes:container',
                learningGoal: 'Recognize misconfigured containers that appear valid but are empty',
                relatedEnemies: ['Shell Beetle', 'Image Wraith'],
              },
            },
            {
              id: 's1-b8',
              position: 8,
              type: 'MINI_CHALLENGE',
              payload: {
                title: 'Fen\'s Riddle: Image Tags',
                description: 'The stranded scribe poses a riddle about image tags. Order these container operations correctly.',
                conceptRef: 'concept:kubernetes:container',
                learningGoal: 'Order container lifecycle events correctly',
                relatedNPCs: ['Fen the Wandering Scribe'],
              },
            },
            {
              id: 's1-b9',
              position: 9,
              type: 'DUNGEON',
              payload: {
                title: 'The Cracked Silos',
                description: 'A collapsed storage facility. Identify intact images from corrupted layers and decoy tags.',
                conceptRef: 'concept:kubernetes:container',
                learningGoal: 'Distinguish valid container images from corrupted layers under pressure',
                relatedEnemies: ['Shell Beetle', 'Silo Hulk (mini-boss)'],
              },
            },
            {
              id: 's1-b10',
              position: 10,
              type: 'BOSS',
              payload: {
                title: 'The Hollow Sovereign',
                description: 'The corrupted spirit of the Fields — containers that lost isolation. Its attacks bleed across boundaries.',
                conceptRef: 'concept:kubernetes:container',
                learningGoal: 'Demonstrate mastery: container isolation, image layers, image vs running instance',
                conceptsRequired: ['concept:kubernetes:container'],
              },
            },
            {
              id: 's1-b11',
              position: 11,
              type: 'PORTAL',
              payload: {
                title: 'Path North Opens',
                description: 'Fields begin reassembling. A village outline appears through the corruption. Lyra: "That\'s Podveil."',
                relatedNPCs: ['Lyra'],
              },
            },
          ],
        },
        {
          id: 'stage-2',
          title: 'Podveil Village',
          conceptRef: 'concept:kubernetes:pod',
          levelRange: [3, 6],
          beats: [
            {
              id: 's2-b1',
              position: 1,
              type: 'ARRIVAL',
              payload: {
                title: 'Arrival at Podveil',
                description: 'A thriving village — now its people are alive but cannot find each other. Groupings broken.',
                relatedNPCs: ['Lyra', 'Mira'],
              },
            },
            {
              id: 's2-b2',
              position: 2,
              type: 'EXPLORATION',
              payload: {
                title: 'The Scattered Village',
                description: 'Explore homes where containers exist but cannot communicate. Mira waits outside a broken home.',
                relatedNPCs: ['Mira', 'Sera the Village Keeper', 'Old Dorn the Pod-Builder'],
              },
            },
            {
              id: 's2-b3',
              position: 3,
              type: 'NPC_INTERACTION',
              payload: {
                title: 'Mira\'s Broken Home',
                description: 'Mira\'s mother is a healer. The two containers in their Pod can no longer communicate. She waits patiently.',
                relatedNPCs: ['Mira'],
              },
            },
            {
              id: 's2-b4',
              position: 4,
              type: 'KNOWLEDGE',
              payload: {
                title: 'What a Pod Is',
                description: 'Old Dorn shows what a healthy Pod looks like — a wrapper for containers sharing network and storage.',
                conceptRef: 'concept:kubernetes:pod',
                learningGoal: 'Understand what a Pod is and why co-location matters',
                relatedNPCs: ['Old Dorn the Pod-Builder'],
              },
            },
            {
              id: 's2-b5',
              position: 5,
              type: 'KNOWLEDGE',
              payload: {
                title: 'Pod Failure is Recoverable',
                description: 'A scroll: the difference between a container dying and a Pod dying — and why Pod failure is not catastrophic.',
                conceptRef: 'concept:kubernetes:pod',
                learningGoal: 'Understand Pod failure and why it is recoverable, not catastrophic',
              },
            },
            {
              id: 's2-b6',
              position: 6,
              type: 'QUEST',
              payload: {
                title: 'Restore Mira\'s Home',
                description: 'Find the right combination of components to restore the Pod — demonstrating what a Pod spec contains.',
                conceptRef: 'concept:kubernetes:pod',
                learningGoal: 'Apply Pod spec knowledge: containers, shared network, storage',
                relatedNPCs: ['Mira', 'Sera the Village Keeper'],
                relatedQuests: ['Quest: Mira\'s Broken Home'],
              },
            },
            {
              id: 's2-b7',
              position: 7,
              type: 'ENCOUNTER',
              payload: {
                title: 'Pod Bugs',
                description: 'Parasitic creatures that sever shared networks between co-located containers.',
                conceptRef: 'concept:kubernetes:pod',
                learningGoal: 'Recognize Pod grouping failures and sever infection patterns',
                relatedEnemies: ['Pod Bug', 'Orphan Shade'],
              },
            },
            {
              id: 's2-b8',
              position: 8,
              type: 'MINI_CHALLENGE',
              payload: {
                title: 'The Scribe\'s Ordering Puzzle',
                description: 'Order the four steps that happen when a Pod starts.',
                conceptRef: 'concept:kubernetes:pod',
                learningGoal: 'Order Pod lifecycle events correctly',
              },
            },
            {
              id: 's2-b9',
              position: 9,
              type: 'DUNGEON',
              payload: {
                title: 'The Pod Warrens',
                description: 'Underground shared spaces — navigate by understanding which containers belong together.',
                conceptRef: 'concept:kubernetes:pod',
                learningGoal: 'Match containers to their correct Pod groupings under pressure',
                relatedEnemies: ['Pod Bug', 'Warren Knot (mini-boss)', 'Orphan Shade'],
              },
            },
            {
              id: 's2-b10',
              position: 10,
              type: 'BOSS',
              payload: {
                title: 'The Pod Tyrant',
                description: 'A Pod so corrupted it consumes everything — too many containers, no isolation, refuses to fail gracefully.',
                conceptRef: 'concept:kubernetes:pod',
                learningGoal: 'Demonstrate mastery: Pod boundaries, co-location rules, spec recognition',
                conceptsRequired: ['concept:kubernetes:pod', 'concept:kubernetes:container'],
              },
            },
            {
              id: 's2-b11',
              position: 11,
              type: 'PORTAL',
              payload: {
                title: 'The Village Reconnects',
                description: 'Mira\'s home restores. Kestran appears at the northern gate, assesses the player, and opens it.',
                relatedNPCs: ['Mira', 'Kestran', 'Lyra'],
              },
            },
          ],
        },
      ],
    },
  ],
}
