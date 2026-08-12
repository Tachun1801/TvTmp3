package com.tvtmp3.backend.entity;

import java.io.Serializable;
import java.time.Instant;
import java.util.Objects;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.MapsId;
import jakarta.persistence.Table;

@Entity
@Table(name = "favorite_songs")
public class FavoriteSong {
    
    @EmbeddedId
    private FavoriteSongId id;

    @ManyToOne
    @MapsId("songId")
    @JoinColumn(name = "song_id")
    private Song song;

    @ManyToOne
    @MapsId("userId")
    @JoinColumn(name = "user_id")
    private User user;

    @Column(name = "created_at")
    private Instant createdAt;
}

@Embeddable
class FavoriteSongId implements Serializable {
    private Long userId;
    private Long songId;

    public FavoriteSongId(){

    }

    public FavoriteSongId(Long userId, Long songId){
        this.userId = userId;
        this.songId = songId;
    }

    @Override
    public boolean equals(Object o){
        if(this == o){
            return true;
        }

        if(!(o instanceof FavoriteSongId)){
            return false;
        }

        FavoriteSongId that = (FavoriteSongId) o;

        return Objects.equals(userId, that.userId) && Objects.equals(songId, that.songId);
    }

    @Override
    public int hashCode(){
        return Objects.hash(userId, songId);
    }
}