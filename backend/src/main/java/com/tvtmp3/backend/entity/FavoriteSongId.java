package com.tvtmp3.backend.entity;

import jakarta.persistence.Embeddable;
import java.util.Objects;
import java.io.Serializable;

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