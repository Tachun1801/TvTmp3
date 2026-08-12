package com.tvtmp3.backend.entity;

import java.io.Serializable;
import java.util.Objects;

import jakarta.persistence.Embeddable;
import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.MapsId;
import jakarta.persistence.Table;

@Entity
@Table(name = "song_genres")
public class SongGenre {

    @EmbeddedId
    private SongGenreId id;

    @ManyToOne
    @MapsId("songId")
    @JoinColumn(name = "song_id")
    private Song song;

    @ManyToOne
    @MapsId("genreId")
    @JoinColumn(name = "genre_id")
    private Genre genre;
}

@Embeddable
class SongGenreId implements Serializable {
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