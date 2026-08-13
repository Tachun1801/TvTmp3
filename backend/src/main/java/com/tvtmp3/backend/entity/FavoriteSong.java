package com.tvtmp3.backend.entity;

import java.time.Instant;

import jakarta.persistence.Column;
import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.MapsId;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;
@Entity
@Table(name = "favorite_songs")
public class FavoriteSong {
    
    @Getter
    @EmbeddedId
    private FavoriteSongId id;

    @Getter
    @Setter
    @ManyToOne
    @MapsId("songId")
    @JoinColumn(name = "song_id")
    private Song song;

    @Getter
    @Setter
    @ManyToOne
    @MapsId("userId")
    @JoinColumn(name = "user_id")
    private User user;

    @Getter
    @Column(name = "created_at")
    private Instant createdAt;
}
