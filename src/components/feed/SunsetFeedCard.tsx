import React, { useState } from 'react';
import { StyleSheet, View, Image, TouchableOpacity, Pressable } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { Post } from '@/services/mock-data';
import { socialService } from '@/services/social-service';
import { useGloamTheme } from '@/hooks/use-theme';
import { AppIcon } from '@/components/ui/app-icon';

interface Props {
  post: Post;
}

export function SunsetFeedCard({ post }: Props) {
  const { colors, isDark } = useGloamTheme();
  const [lastTap, setLastTap] = useState<number>(0);

  const handleLike = () => {
    socialService.toggleLike(post.id);
  };

  // Double-tap on photo to like (BeReal style)
  const handleDoubleTap = () => {
    const now = Date.now();
    const DOUBLE_PRESS_DELAY = 300;
    if (lastTap && now - lastTap < DOUBLE_PRESS_DELAY) {
      if (!post.isLiked) {
        handleLike();
      }
    } else {
      setLastTap(now);
    }
  };

  return (
    <View style={styles.cardContainer}>
      {/* Sleek, Low-Profile Author Metadata Row */}
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <Image
            source={{ uri: post.userAvatar }}
            style={styles.avatar}
          />
          <View style={styles.nameBlock}>
            <ThemedText style={styles.username}>{post.username}</ThemedText>
            <ThemedText style={styles.metaText}>
              {post.location} • {post.timestamp}
            </ThemedText>
          </View>
        </View>

        <TouchableOpacity
          style={styles.moreBtn}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <ThemedText style={styles.moreDots}>•••</ThemedText>
        </TouchableOpacity>
      </View>

      {/* Edge-to-Edge Media with Rounded Corners */}
      <Pressable onPress={handleDoubleTap} style={styles.imageContainer}>
        <Image
          source={{ uri: post.imageUrl }}
          style={styles.postImage}
          resizeMode="cover"
        />

        {/* Floating Location Overlay Pill */}
        <View style={styles.locationPill}>
          <AppIcon
            name="location"
            size={11}
            color="#FF5E3A"
            style={{ marginRight: 4 }}
          />
          <ThemedText style={styles.locationPillText}>
            {post.location}
          </ThemedText>
        </View>
      </Pressable>

      {/* Post Actions & Caption */}
      <View style={styles.footer}>
        <View style={styles.actionBar}>
          <TouchableOpacity
            onPress={handleLike}
            style={[
              styles.likeButton,
              post.isLiked ? styles.likeButtonActive : styles.likeButtonInactive,
            ]}
            activeOpacity={0.75}>
            <AppIcon
              name={post.isLiked ? 'heart-fill' : 'heart'}
              size={15}
              color={post.isLiked ? '#FF2D55' : '#8E8E93'}
            />
            <ThemedText
              style={[
                styles.likeCount,
                { color: post.isLiked ? '#FF2D55' : '#FFFFFF' },
              ]}>
              {post.likes ?? 0}
            </ThemedText>
          </TouchableOpacity>
        </View>

        {/* Caption */}
        {post.description ? (
          <View style={styles.captionContainer}>
            <ThemedText style={styles.captionText}>
              <ThemedText style={styles.captionAuthor}>
                {post.username}{' '}
              </ThemedText>
              <ThemedText style={styles.captionBody}>
                {post.description}
              </ThemedText>
            </ThemedText>
          </View>
        ) : null}
      </View>

      {/* Clear Visual Division Between Posts */}
      <View style={styles.postDivider} />
    </View>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    width: '100%',
    marginBottom: Spacing.four,
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.three,
    paddingVertical: 6,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  avatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#262626',
    backgroundColor: '#1C1C1E',
  },
  nameBlock: {
    justifyContent: 'center',
  },
  username: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.1,
  },
  metaText: {
    fontSize: 10.5,
    fontWeight: '500',
    color: '#8E8E93',
    marginTop: 0.5,
  },
  moreBtn: {
    padding: Spacing.one,
  },
  moreDots: {
    fontSize: 15,
    letterSpacing: 1,
    color: '#666666',
  },
  imageContainer: {
    width: '100%',
    aspectRatio: 3 / 4, // Expansive portrait format
    position: 'relative',
    backgroundColor: '#050505',
    borderRadius: 24, // Generous rounded corners on media
    overflow: 'hidden',
  },
  postImage: {
    width: '100%',
    height: '100%',
  },
  locationPill: {
    position: 'absolute',
    bottom: Spacing.three,
    left: Spacing.three,
    backgroundColor: 'rgba(0, 0, 0, 0.78)',
    paddingHorizontal: Spacing.three,
    paddingVertical: 5,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.16)',
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationPillText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  footer: {
    paddingHorizontal: Spacing.three,
    paddingTop: 8,
    paddingBottom: Spacing.two,
  },
  actionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  likeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 9,
    paddingVertical: 4.5,
    borderRadius: 16,
    borderWidth: 1,
  },
  likeButtonInactive: {
    backgroundColor: '#141414',
    borderColor: '#242424',
  },
  likeButtonActive: {
    backgroundColor: 'rgba(255, 45, 85, 0.12)',
    borderColor: 'rgba(255, 45, 85, 0.28)',
  },
  likeCount: {
    fontSize: 12,
    fontWeight: '800',
  },
  captionContainer: {
    marginTop: 1,
  },
  captionAuthor: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  captionBody: {
    color: '#E0E0E0',
  },
  captionText: {
    fontSize: 13,
    lineHeight: 18,
  },
  // Distinct division line between posts
  postDivider: {
    height: 1,
    backgroundColor: '#1E1E1E',
    marginTop: Spacing.two + 4,
    marginHorizontal: Spacing.four,
  },
});
