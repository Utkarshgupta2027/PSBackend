package payment_system_backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import payment_system_backend.model.Transaction;
import payment_system_backend.repository.TransactionRepository;
import payment_system_backend.service.TransactionService;

import java.util.List;

@RestController
@RequestMapping("/transaction")
@CrossOrigin(origins = "http://localhost:3000")
public class TransactionController {

    @Autowired
    private TransactionService transactionService;

    @Autowired
    private TransactionRepository transactionRepo;

    @PostMapping("/send")
    public String sendMoney(@RequestParam Long senderId,
                            @RequestParam Long receiverId,
                            @RequestParam double amount){

        transactionService.sendMoney(senderId, receiverId, amount);

        return "Payment Successful";
    }

    @GetMapping("/history/{userId}")
    public List<Transaction> history(@PathVariable Long userId){
        return transactionRepo.findBySenderId(userId);
    }

    @PostMapping("/retry/{id}")
    public String retryPayment(@PathVariable Long id){
        transactionService.retryTransaction(id);
        return "Transaction retried";
    }
}