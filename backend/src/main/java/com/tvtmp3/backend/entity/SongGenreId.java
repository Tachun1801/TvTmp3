package com.tvtmp3.backend.entity;

import java.io.Serializable;
import java.util.Objects;

import jakarta.persistence.Embeddable;

@Embeddable
public class SongGenreId implements Serializable {
    private Long songId;
    private Long genreId;
    
    public SongGenreId() {

    }

    public SongGenreId(Long songId, Long genreId){
        this.songId = songId;
        this.genreId = genreId;
    }

    @Override
    public boolean equals(Object o){
        if(this == o){
            return true;
        }

        if(!(o instanceof SongGenreId)){
            return false;
        }

        SongGenreId that = (SongGenreId) o;

        return Objects.equals(songId, that.songId) && Objects.equals(genreId, that.genreId);
    }

    @Override
    public int hashCode(){
        return Objects.hash(songId, genreId);
    }
}