// app/(tabs)/_layout.tsx
import Ionicons from '@expo/vector-icons/Ionicons'
import { useQueryClient } from '@tanstack/react-query'
import { router, Tabs, usePathname } from 'expo-router'
import { useEffect } from 'react'
import { Image, StyleSheet, TouchableOpacity, View } from 'react-native'

import { useAuth } from '@/contexts/AuthContext'
import { getAcquiredBadges } from '@/libs/api/badge/getAcquiredBadges'
import { useReplaceTab } from '@/libs/hooks/tabs/useReplaceTab'

const TAB_BAR_HEIGHT = 80

const ICONS = {
  home: [
    require('../../assets/images/tabs/home.svg'),
    require('../../assets/images/tabs/home-active.svg'),
  ],
  recommend: [
    require('../../assets/images/tabs/recommend.svg'),
    require('../../assets/images/tabs/recommend-active.svg'),
  ],
  mission: [
    require('../../assets/images/tabs/mission.svg'),
    require('../../assets/images/tabs/mission-active.svg'),
  ],
  mypage: [
    require('../../assets/images/tabs/mypage.svg'),
    require('../../assets/images/tabs/mypage-active.svg'),
  ],
} as const

function CenterAddButton() {
  return (
    <View pointerEvents="box-none" style={styles.fabWrap}>
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => router.push('/(modals)/add-chore')}
        style={styles.fabBtn}
      >
        <Ionicons name="add" size={40} color="#fff" />
      </TouchableOpacity>
    </View>
  )
}

export default function TabsLayout() {
  const replaceTab = useReplaceTab()
  const { user, verified } = useAuth()
  const qc = useQueryClient()

  const pathname = usePathname()
  const hideFab =
    pathname.includes('mybadges') ||
    pathname.includes('notifications') ||
    pathname.includes('mypage/withdraw') ||
    pathname.includes('recommend/space-chores')

  useEffect(() => {
    if (!verified || !user?.id) return
    qc.fetchQuery({
      queryKey: ['badge', 'acquired'],
      queryFn: getAcquiredBadges,
    })
  }, [verified, user?.id, qc])

  return (
    <View style={styles.root}>
      <Tabs
        initialRouteName="home"
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarActiveTintColor: '#57C9D0',
          tabBarInactiveTintColor: '#B4B7BC',
          tabBarLabelStyle: { fontSize: 12, fontWeight: 700, marginTop: 3 },
          sceneContainerStyle: { backgroundColor: '#F8F8FA' },

          tabBarStyle: {
            height: TAB_BAR_HEIGHT,
            paddingBottom: 6,
            paddingTop: 10,
            elevation: 0,
            shadowOpacity: 0,
            backgroundColor: '#F8F8FA',
            position: 'absolute',
            borderTopWidth: 0,
          },

          // 배경 레이어 터치 간섭 방지
          tabBarBackground: () => <View pointerEvents="none" style={styles.tabBarBg} />,

          tabBarIcon: ({ focused }) => {
            const tabKey = route.name.split('/')[0] as keyof typeof ICONS
            const [inactive, active] = ICONS[tabKey] ?? []
            if (!inactive || !active) return null

            return (
              <Image
                source={focused ? active : inactive}
                style={styles.tabIcon}
                resizeMode="contain"
              />
            )
          },
        })}
      >
        <Tabs.Screen
          name="home"
          options={{ title: '홈' }}
          listeners={{
            tabPress: (e) => {
              e.preventDefault()
              replaceTab('/(tabs)/home')
            },
          }}
        />

        <Tabs.Screen
          name="recommend/index"
          options={{ title: '추천' }}
          listeners={{
            tabPress: (e) => {
              e.preventDefault()
              replaceTab('/(tabs)/recommend')
            },
          }}
        />

        <Tabs.Screen
          name="recommend/space-chores"
          options={{
            href: null,
            tabBarStyle: { display: 'none' },
            headerShown: false,
          }}
        />

        {/* 가운데 슬롯용 더미 탭 (탭바에만 자리 차지, 클릭 방지) */}
        <Tabs.Screen
          name="__dummy__"
          options={{
            title: '',
            tabBarLabel: () => null,
            tabBarIcon: () => null,
          }}
          listeners={{
            tabPress: (e) => {
              e.preventDefault()
            },
          }}
        />

        <Tabs.Screen
          name="mission"
          options={{ title: '미션' }}
          listeners={{
            tabPress: (e) => {
              e.preventDefault()
              replaceTab('/(tabs)/mission')
            },
          }}
        />

        <Tabs.Screen
          name="mypage/index"
          options={{ title: '마이페이지' }}
          listeners={{
            tabPress: (e) => {
              e.preventDefault()
              replaceTab('/(tabs)/mypage')
            },
          }}
        />

        <Tabs.Screen
          name="mypage/withdraw"
          options={{
            href: null,
            tabBarStyle: { display: 'none' },
            headerShown: false,
          }}
        />

        <Tabs.Screen
          name="notifications"
          options={{
            href: null,
            tabBarStyle: { display: 'none' },
            headerShown: false,
          }}
        />

        <Tabs.Screen
          name="mybadges"
          options={{
            href: null,
            tabBarStyle: { display: 'none' },
            headerShown: false,
          }}
        />

        {/* addChore 탭은 존재하더라도 탭바에서 숨김 */}
        <Tabs.Screen
          name="addChore"
          options={{
            href: null,
            headerShown: false,
          }}
        />
      </Tabs>

      <Tabs.Screen
        name="show-allChore"
        options={{
          href: null, // 탭 버튼 숨김
          headerShown: false,
        }}
      />

      {!hideFab && <CenterAddButton />}
    </View>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },

  // FAB: 화면 정중앙 (터치 영역이 새지 않도록 wrapper 크기 고정)
  fabWrap: {
    position: 'absolute',
    left: '50%',
    bottom: 15,
    transform: [{ translateX: -24 }],
    zIndex: 999,
    width: 48,
    height: 48,
  },
  fabBtn: {
    width: 48,
    height: 48,
    backgroundColor: '#57C9D0',
    borderRadius: 9999,
    alignItems: 'center',
    justifyContent: 'center',
  },

  tabBarBg: {
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderRightWidth: 1,
    borderLeftWidth: 1,
    borderColor: '#E5E5E5',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },

  tabIcon: {
    width: 24,
    height: 24,
  },
})
