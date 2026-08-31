package com.tvtmp3.backend.controller;

import java.util.Map;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.tvtmp3.backend.dto.HistoryDto;
import com.tvtmp3.backend.dto.HistoryRequest;
import com.tvtmp3.backend.dto.PageResponse;
import com.tvtmp3.backend.service.HistoryService;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;

/**
 * Endpoint lịch sử nghe — CẦN TOKEN (anyRequest().authenticated()).
 */
@RestController
@RequestMapping("/api/v1/history")
public class HistoryController {

    private final HistoryService historyService;

    public HistoryController(HistoryService historyService) {
        this.historyService = historyService;
    }

    /** GET /api/v1/history — lịch sử nghe mới nhất trước. */
    @GetMapping
    public PageResponse<HistoryDto> getHistory(
            @RequestParam(defaultValue = "1") @Min(1) int page,
            @RequestParam(defaultValue = "20") @Min(1) @Max(100) int size) {
        return historyService.getHistory(page, size);
    }

    /** POST /api/v1/history — ghi nhận vừa nghe 1 bài. Response { success: true }. */
    @PostMapping
    public Map<String, Boolean> record(@Valid @RequestBody HistoryRequest request) {
        historyService.record(request.songId());
        return Map.of("success", true);
    }
}
