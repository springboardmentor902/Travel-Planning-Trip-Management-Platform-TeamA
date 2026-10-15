package com.tripnest.backend.service;

import com.tripnest.backend.dto.SettlementResponse;
import com.tripnest.backend.entity.Expense;
import com.tripnest.backend.entity.ExpenseSplit;
import com.tripnest.backend.entity.User;
import com.tripnest.backend.repository.ExpenseRepository;
import com.tripnest.backend.repository.TripRepository;
import com.tripnest.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SettlementService {

    private final ExpenseRepository expenseRepository;
    private final TripRepository tripRepository;
    private final UserRepository userRepository;

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext()
                .getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));
    }

    public SettlementResponse calculateSettlement(Long tripId) {

        var trip = tripRepository.findById(tripId)
                .orElseThrow(() ->
                        new RuntimeException("Trip not found"));

        // Sirf shared expenses lo
        List<Expense> sharedExpenses = expenseRepository
                .findByTripId(tripId)
                .stream()
                .filter(e -> Boolean.TRUE.equals(e.getIsShared()))
                .collect(Collectors.toList());

        // Har user ka balance track karo
        // Key: userId, Value: net balance
        Map<Long, Double> balanceMap = new HashMap<>();
        Map<Long, String> nameMap = new HashMap<>();
        Map<Long, String> emailMap = new HashMap<>();
        Map<Long, Double> paidMap = new HashMap<>();
        Map<Long, Double> owedMap = new HashMap<>();

        double totalShared = 0;

        for (Expense expense : sharedExpenses) {
            totalShared += expense.getAmount();

            List<ExpenseSplit> splits = expense.getSplits();
            if (splits == null || splits.isEmpty()) continue;

            // Payer ko credit do — usne poora amount diya
            User payer = expense.getPaidBy();
            balanceMap.merge(payer.getId(),
                    expense.getAmount(), Double::sum);
            paidMap.merge(payer.getId(),
                    expense.getAmount(), Double::sum);
            nameMap.put(payer.getId(), payer.getName());
            emailMap.put(payer.getId(), payer.getEmail());

            // Har member ko unka share debit karo
            for (ExpenseSplit split : splits) {
                User member = split.getUser();
                nameMap.put(member.getId(), member.getName());
                emailMap.put(member.getId(), member.getEmail());

                balanceMap.merge(member.getId(),
                        -split.getShareAmount(), Double::sum);
                owedMap.merge(member.getId(),
                        split.getShareAmount(), Double::sum);
            }
        }

        // Member balances banao
        List<SettlementResponse.MemberBalance> memberBalances =
                new ArrayList<>();

        for (Long userId : balanceMap.keySet()) {
            SettlementResponse.MemberBalance mb =
                    new SettlementResponse.MemberBalance();
            mb.setUserId(userId);
            mb.setUserName(nameMap.getOrDefault(userId, "Unknown"));
            mb.setUserEmail(emailMap.getOrDefault(userId, ""));
            mb.setTotalPaid(paidMap.getOrDefault(userId, 0.0));
            mb.setTotalOwed(owedMap.getOrDefault(userId, 0.0));
            mb.setNetBalance(round(balanceMap.get(userId)));
            memberBalances.add(mb);
        }

        // Settlement transactions calculate karo
        List<SettlementResponse.Transaction> transactions =
                calculateMinTransactions(
                        balanceMap, nameMap);

        SettlementResponse res = new SettlementResponse();
        res.setTripId(tripId);
        res.setTripTitle(trip.getTitle());
        res.setTotalSharedAmount(round(totalShared));
        res.setMemberBalances(memberBalances);
        res.setTransactions(transactions);

        return res;
    }

    // Greedy algorithm — minimum transactions
    private List<SettlementResponse.Transaction>
            calculateMinTransactions(
                    Map<Long, Double> balanceMap,
                    Map<Long, String> nameMap) {

        List<SettlementResponse.Transaction> transactions =
                new ArrayList<>();

        // Debtors — jinhe dena hai (negative balance)
        // Creditors — jinhe receive karna hai (positive balance)
        PriorityQueue<long[]> debtors = new PriorityQueue<>(
                (a, b) -> Double.compare(a[1], b[1]));
        PriorityQueue<long[]> creditors = new PriorityQueue<>(
                (a, b) -> Double.compare(b[1], a[1]));

        for (Map.Entry<Long, Double> entry :
                balanceMap.entrySet()) {
            double bal = round(entry.getValue());
            if (bal < -0.01) {
                debtors.offer(new long[]{
                    entry.getKey(),
                    (long)(bal * 100)
                });
            } else if (bal > 0.01) {
                creditors.offer(new long[]{
                    entry.getKey(),
                    (long)(bal * 100)
                });
            }
        }

        // Greedy matching
        while (!debtors.isEmpty() && !creditors.isEmpty()) {
            long[] debtor   = debtors.poll();
            long[] creditor = creditors.poll();

            long debtAmt   = -debtor[1];
            long creditAmt = creditor[1];
            long settle    = Math.min(debtAmt, creditAmt);

            SettlementResponse.Transaction txn =
                    new SettlementResponse.Transaction();
            txn.setFromUserId(debtor[0]);
            txn.setFromUserName(
                    nameMap.getOrDefault(debtor[0], "Unknown"));
            txn.setToUserId(creditor[0]);
            txn.setToUserName(
                    nameMap.getOrDefault(creditor[0], "Unknown"));
            txn.setAmount(round(settle / 100.0));
            transactions.add(txn);

            long remaining = creditAmt - settle;
            long leftover  = debtAmt  - settle;

            if (remaining > 1) {
                creditors.offer(new long[]{
                    creditor[0], remaining});
            }
            if (leftover > 1) {
                debtors.offer(new long[]{
                    debtor[0], -leftover});
            }
        }

        return transactions;
    }

    // 2 decimal places tak round karo
    private double round(double value) {
        return Math.round(value * 100.0) / 100.0;
    }
}