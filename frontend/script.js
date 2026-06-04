const API_BASE = "http://localhost:3000/api";
const catColors={Food:'#FF3D8A',Transport:'#3B82F6',Shopping:'#8B5CF6',Education:'#2EC987',Entertainment:'#FF9340',Income:'#10B981'};
const catIcons={Food:'🍔',Transport:'🚌',Shopping:'🛍️',Education:'📚',Entertainment:'🎮',Income:'💼'};
const defaultTransactions=[{name:'Coffee Shop',cat:'Food',date:'12 Juni',amount:-25000,status:'completed'},{name:'Freelance Design',cat:'Income',date:'10 Juni',amount:500000,status:'completed'},{name:'Transport',cat:'Transport',date:'9 Juni',amount:-15000,status:'completed'},{name:'Course Payment',cat:'Education',date:'8 Juni',amount:-150000,status:'pending'}];
let transactions=JSON.parse(localStorage.getItem('pink_transactions'))||defaultTransactions;
let settings=JSON.parse(localStorage.getItem('pink_settings'))||{name:'Farrel',initialBalance:2450000,monthlyBudget:4000000};
let budgets=JSON.parse(localStorage.getItem('pink_budgets'))||{Food:1200000,Transport:600000,Shopping:700000,Education:900000,Entertainment:500000};
let currentFilter='All', currentTab='monthly';
function save(){localStorage.setItem('pink_transactions',JSON.stringify(transactions));localStorage.setItem('pink_settings',JSON.stringify(settings));localStorage.setItem('pink_budgets',JSON.stringify(budgets));}
function rupiah(n){return 'Rp'+Math.round(Number(n)||0).toLocaleString('id-ID');}
function expenseSum(){return transactions.filter(t=>t.amount<0).reduce((a,t)=>a+Math.abs(t.amount),0)}
function incomeSum(){return transactions.filter(t=>t.amount>0).reduce((a,t)=>a+t.amount,0)}
function balance(){return settings.initialBalance+incomeSum()-expenseSum()}
function showPage(el,page){document.querySelectorAll('.nav-item').forEach(i=>i.classList.remove('active'));el.classList.add('active');activatePage(page)}
function showPageByName(page){document.querySelector(`.nav-item[data-page="${page}"]`).click()}
function activatePage(page){document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));document.getElementById(page+'Page').classList.add('active');const titles={dashboard:['Hi, '+settings.name+' 👋','Here is your financial overview for this month'],transactions:['Transactions','Kelola transaksi pemasukan dan pengeluaran.'],budget:['Budget','Atur batas pengeluaran per kategori.'],reports:['Reports','Lihat rangkuman finansial secara ringkas.'],settings:['Settings','Atur profil dan data aplikasi.']};document.getElementById('pageTitle').textContent=titles[page][0];document.getElementById('pageSubtitle').textContent=titles[page][1];renderAll();}
function txRow(t,i,withAction=false){const isPos=t.amount>0,amt=(isPos?'+':'-')+rupiah(Math.abs(t.amount)),color=catColors[t.cat]||'#999';return `<tr><td><div class="txn-name"><div class="txn-icon" style="background:${color}22;">${catIcons[t.cat]||'💳'}</div><span>${t.name}</span></div></td><td><span class="cat-badge" style="background:${color}18;color:${color};">${t.cat}</span></td><td style="color:var(--text-3);font-size:12px;">${t.date}</td><td><span class="${isPos?'amount-pos':'amount-neg'}">${amt}</span></td><td><span class="status-badge ${t.status}">${t.status[0].toUpperCase()+t.status.slice(1)}</span></td>${withAction?`<td><button class="mini-danger" onclick="deleteTx(${i})">Delete</button></td>`:''}</tr>`}
function renderTxn() {
    window.addEventListener("load", async () => {
  await loadTransactions();
  renderCats();

  setTimeout(() => {
    drawChart(currentTab);
  }, 50);
});

  const body = document.getElementById("txnBody");

  body.innerHTML = transactions.map(t => {
    const isPos = t.amount > 0;
    const amtStr =
      (isPos ? "+" : "-") +
      "Rp" +
      Math.abs(t.amount).toLocaleString("id-ID");

    const catColor = catColors[t.cat] || "#999";

    return `
      <tr>
        <td>
          <div class="txn-name">
            <div class="txn-icon" style="background:${catColor}22;">
              ${catIcons[t.cat] || "💳"}
            </div>
            <span>${t.name}</span>
          </div>
        </td>

        <td>
          <span class="cat-badge" style="background:${catColor}18;color:${catColor};">
            ${t.cat}
          </span>
        </td>

        <td style="color:var(--text-3);font-size:12px;">
          ${t.date}
        </td>

        <td>
          <span class="${isPos ? "amount-pos" : "amount-neg"}">
            ${amtStr}
          </span>
        </td>

        <td>
          <span class="status-badge ${t.status}">
            ${t.status.charAt(0).toUpperCase() + t.status.slice(1)}
          </span>
        </td>

        <td>
          <button class="delete-btn" onclick="deleteTransaction(${t.id})">
            Hapus
          </button>
        </td>
      </tr>
    `;
  }).join("");
}

function renderStats(){document.getElementById('balanceVal').textContent=rupiah(balance());document.getElementById('incomeVal').textContent=rupiah(incomeSum());document.getElementById('expenseVal').textContent=rupiah(expenseSum());document.getElementById('avatarInitial').textContent=(settings.name||'F').charAt(0).toUpperCase();let used=expenseSum(),pct=settings.monthlyBudget?Math.min(100,Math.round(used/settings.monthlyBudget*100)):0;document.getElementById('budgetUsed').textContent=rupiah(used);document.getElementById('budgetTotal').textContent=rupiah(settings.monthlyBudget);document.getElementById('budgetFill').style.width=pct+'%';document.getElementById('budgetSub').textContent=`You've used ${pct}% of your monthly limit.`}
function renderCats(){const cats=Object.keys(budgets).map(c=>({name:c,spent:transactions.filter(t=>t.cat===c&&t.amount<0).reduce((a,t)=>a+Math.abs(t.amount),0)}));document.getElementById('categoriesList').innerHTML=cats.map(c=>{let total=budgets[c.name]||1,pct=Math.min(100,Math.round(c.spent/total*100)),color=catColors[c.name];return `<div class="cat-item"><div class="cat-row"><div class="cat-name"><span class="cat-dot" style="background:${color};"></span>${c.name}</div><span class="cat-pct">${pct}%</span></div><div class="cat-track"><div class="cat-bar" style="width:${pct}%;background:${color};"></div></div></div>`}).join('')}
function renderBudget(){document.getElementById('budgetForm').innerHTML=Object.keys(budgets).map(c=>`<div class="form-group" style="margin-bottom:10px"><div class="form-label">${c}</div><div class="amount-input"><span class="amount-prefix">Rp</span><input id="budget_${c}" type="number" value="${budgets[c]}"></div></div>`).join('');document.getElementById('budgetList').innerHTML=Object.keys(budgets).map(c=>{let spent=transactions.filter(t=>t.cat===c&&t.amount<0).reduce((a,t)=>a+Math.abs(t.amount),0),pct=Math.min(100,Math.round(spent/budgets[c]*100)),color=catColors[c];return `<div class="cat-item"><div class="cat-row"><div class="cat-name"><span class="cat-dot" style="background:${color};"></span>${c} <small style="color:var(--text-3)">${rupiah(spent)} / ${rupiah(budgets[c])}</small></div><span class="cat-pct">${pct}%</span></div><div class="cat-track"><div class="cat-bar" style="width:${pct}%;background:${color};"></div></div></div>`}).join('')}
function renderReports(){let inc=Math.max(0,...transactions.filter(t=>t.amount>0).map(t=>t.amount));let exp=Math.max(0,...transactions.filter(t=>t.amount<0).map(t=>Math.abs(t.amount)));let counts={};transactions.forEach(t=>counts[t.cat]=(counts[t.cat]||0)+1);let top=Object.entries(counts).sort((a,b)=>b[1]-a[1])[0]?.[0]||'-';document.getElementById('reportIncome').textContent=rupiah(inc);document.getElementById('reportExpense').textContent=rupiah(exp);document.getElementById('reportCategory').textContent=top;document.getElementById('reportBars').innerHTML=Object.keys(catColors).map(c=>{let val=transactions.filter(t=>t.cat===c).reduce((a,t)=>a+Math.abs(t.amount),0),pct=Math.min(100,Math.round(val/(expenseSum()+incomeSum()||1)*100));return `<div class="cat-item"><div class="cat-row"><div class="cat-name"><span class="cat-dot" style="background:${catColors[c]};"></span>${c}</div><span class="cat-pct">${rupiah(val)}</span></div><div class="cat-track"><div class="cat-bar" style="width:${pct}%;background:${catColors[c]};"></div></div></div>`}).join('');document.getElementById('reportSummary').innerHTML=`<p>Total pemasukan: <b>${rupiah(incomeSum())}</b></p><p>Total pengeluaran: <b>${rupiah(expenseSum())}</b></p><p>Sisa saldo saat ini: <b>${rupiah(balance())}</b></p><p>Kategori paling sering dipakai: <b>${top}</b></p>`}
function renderSettings(){document.getElementById('setName').value=settings.name;document.getElementById('setBalance').value=settings.initialBalance;document.getElementById('setBudget').value=settings.monthlyBudget}
async function addTransaction() {
  const name = document.getElementById("txName").value.trim();
  const type = document.getElementById("txType").value;
  const cat = document.getElementById("txCat").value;
  const amount = parseFloat(document.getElementById("txAmount").value);

  if (!name || !amount || amount <= 0) {
    showToast("⚠️ Isi nama dan jumlah dengan benar!");
    return;
  }

  try {
    const response = await fetch(`${API_BASE}/transactions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        name,
        type,
        category: cat,
        amount,
        status: "completed",
        transaction_date: new Date().toISOString().split("T")[0]
      })
    });

    const result = await response.json();

    if (!result.success) {
      showToast("⚠️ Gagal menambahkan transaksi");
      return;
    }

    document.getElementById("txName").value = "";
    document.getElementById("txAmount").value = "";

    await loadTransactions();

    showToast("✅ Transaksi berhasil masuk database!");
  } catch (error) {
    console.error(error);
    showToast("⚠️ Server error, cek backend lu");
  }
}

function deleteTx(i){transactions.splice(i,1);save();renderAll();showToast('🗑️ Transaksi dihapus')}
function filterTransactions(el,type){document.querySelectorAll('#transactionsPage .tab').forEach(t=>t.classList.remove('active'));el.classList.add('active');currentFilter=type;renderTxn()}
function saveBudget(){Object.keys(budgets).forEach(c=>budgets[c]=Number(document.getElementById('budget_'+c).value)||0);save();renderAll();showModal('Budget Tersimpan','Limit budget per kategori sudah diperbarui.','📋')}
function saveSettings(){settings.name=document.getElementById('setName').value||'Farrel';settings.initialBalance=Number(document.getElementById('setBalance').value)||0;settings.monthlyBudget=Number(document.getElementById('setBudget').value)||0;save();renderAll();activatePage('settings');showModal('Settings Tersimpan','Profile dan pengaturan berhasil diperbarui.','⚙️')}
function resetData(){localStorage.removeItem('pink_transactions');localStorage.removeItem('pink_settings');localStorage.removeItem('pink_budgets');transactions=[...defaultTransactions];settings={name:'Farrel',initialBalance:2450000,monthlyBudget:4000000};budgets={Food:1200000,Transport:600000,Shopping:700000,Education:900000,Entertainment:500000};save();renderAll();showModal('Data Direset','Semua data dikembalikan ke contoh awal.','🧹')}
function exportReport(){const txt=`PinkWallet Report\nIncome: ${rupiah(incomeSum())}\nExpense: ${rupiah(expenseSum())}\nBalance: ${rupiah(balance())}\nTransactions: ${transactions.length}`;const blob=new Blob([txt],{type:'text/plain'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='pinkwallet-report.txt';a.click();URL.revokeObjectURL(url);showToast('📄 Report berhasil diexport')}
function showToast(msg){document.getElementById('toastMsg').textContent=msg;document.getElementById('toast').classList.add('show');setTimeout(()=>document.getElementById('toast').classList.remove('show'),2500)}
function showModal(title,msg,icon='✅'){document.getElementById('modalTitle').textContent=title;document.getElementById('modalMsg').textContent=msg;document.getElementById('modalIcon').textContent=icon;document.getElementById('modalOverlay').classList.add('show')}
function closeModal(){document.getElementById('modalOverlay').classList.remove('show')}
const chartData={weekly:[120,95,180,60,200,140,90],monthly:[400,320,550,480,620,510,430,580,490,600,520,650],yearly:[5200,4800,6100,5600,7000,6400]},chartLabels={weekly:['Sen','Sel','Rab','Kam','Jum','Sab','Min'],monthly:['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'],yearly:['2019','2020','2021','2022','2023','2024']};
function drawChart(tab){const canvas=document.getElementById('spendingChart');if(!canvas)return;const ctx=canvas.getContext('2d'),W=canvas.offsetWidth,H=canvas.offsetHeight;canvas.width=W;canvas.height=H;const data=chartData[tab],labels=chartLabels[tab],maxV=Math.max(...data),pad={top:10,right:20,bottom:36,left:44},cW=W-pad.left-pad.right,cH=H-pad.top-pad.bottom,barW=Math.max(8,(cW/data.length)*.55),step=cW/data.length;ctx.clearRect(0,0,W,H);ctx.strokeStyle='#EDE8F5';ctx.lineWidth=1;for(let i=0;i<=4;i++){const y=pad.top+cH*(1-i/4);ctx.beginPath();ctx.moveTo(pad.left,y);ctx.lineTo(W-pad.right,y);ctx.stroke();ctx.fillStyle='#A899B8';ctx.font='10px DM Mono';ctx.textAlign='right';const v=Math.round(maxV*i/4);ctx.fillText(v>=1000?(v/1000)+'k':v,pad.left-6,y+4)}data.forEach((v,i)=>{const x=pad.left+i*step+step/2-barW/2,bH=(v/maxV)*cH,y=pad.top+cH-bH,r=barW/2,grd=ctx.createLinearGradient(0,y,0,pad.top+cH);grd.addColorStop(0,'#FF3D8A');grd.addColorStop(1,'rgba(255,61,138,.15)');ctx.beginPath();ctx.moveTo(x+r,y);ctx.lineTo(x+barW-r,y);ctx.quadraticCurveTo(x+barW,y,x+barW,y+r);ctx.lineTo(x+barW,pad.top+cH);ctx.lineTo(x,pad.top+cH);ctx.lineTo(x,y+r);ctx.quadraticCurveTo(x,y,x+r,y);ctx.closePath();ctx.fillStyle=grd;ctx.fill();ctx.fillStyle='#A899B8';ctx.font='10px Plus Jakarta Sans';ctx.textAlign='center';ctx.fillText(labels[i],x+barW/2,H-8)})}
function switchTab(el,tab){document.querySelectorAll('.tab').forEach(t=>t.classList.remove('active'));el.classList.add('active');currentTab=tab;drawChart(tab)}
function renderAll(){renderStats();renderTxn();renderCats();renderBudget();renderReports();renderSettings();setTimeout(()=>drawChart(currentTab),30)}
document.getElementById('searchInput').addEventListener('input',renderTxn);window.addEventListener('resize',()=>drawChart(currentTab));window.addEventListener('load',renderAll);
async function loadTransactions() {
  try {
    const response = await fetch(`${API_BASE}/transactions`);
    const result = await response.json();

    if (!result.success) {
      showToast("⚠️ Gagal mengambil data transaksi");
      return;
    }

    transactions = result.data.map(item => ({
      id: item.id,
      name: item.name,
      cat: item.category,
      date: formatDate(item.transaction_date),
      amount: item.type === "Income"
        ? Number(item.amount)
        : -Number(item.amount),
      status: item.status
    }));

    renderTxn();
    updateDashboard();
  } catch (error) {
    console.error(error);
    showToast("⚠️ Backend belum aktif atau API error");
  }
}

function formatDate(dateString) {
  const date = new Date(dateString);
  const months = [
    "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
    "Jul", "Agu", "Sep", "Okt", "Nov", "Des"
  ];

  return `${date.getDate()} ${months[date.getMonth()]}`;
}
async function deleteTransaction(id) {
  const confirmDelete = confirm("Yakin mau hapus transaksi ini?");

  if (!confirmDelete) return;

  try {
    const response = await fetch(`${API_BASE}/transactions/${id}`, {
      method: "DELETE"
    });

    const result = await response.json();

    if (!result.success) {
      showToast("⚠️ Gagal menghapus transaksi");
      return;
    }

    await loadTransactions();
    showToast("✅ Transaksi berhasil dihapus");
  } catch (error) {
    console.error(error);
    showToast("⚠️ Gagal konek ke backend");
  }
}

async function updateDashboard() {
  try {
    const response = await fetch(`${API_BASE}/reports/summary`);
    const result = await response.json();

    if (!result.success) return;

    const data = result.data;

    const balanceEl = document.getElementById("balanceVal");
    const incomeEl = document.querySelector(".stat-card.income .stat-value");
    const expenseEl = document.querySelector(".stat-card.expense .stat-value");

    if (balanceEl) {
      balanceEl.textContent = "Rp" + data.balance.toLocaleString("id-ID");
    }

    if (incomeEl) {
      incomeEl.textContent = "Rp" + data.total_income.toLocaleString("id-ID");
    }

    if (expenseEl) {
      expenseEl.textContent = "Rp" + data.total_expense.toLocaleString("id-ID");
    }
  } catch (error) {
    console.error(error);
  }
}

async function updateDashboard() {
  try {
    const response = await fetch(`${API_BASE}/reports/summary`);
    const result = await response.json();

    if (!result.success) return;

    const data = result.data;

    const balanceEl = document.getElementById("balanceVal");
    const incomeEl = document.querySelector(".stat-card.income .stat-value");
    const expenseEl = document.querySelector(".stat-card.expense .stat-value");

    if (balanceEl) {
      balanceEl.textContent = "Rp" + data.balance.toLocaleString("id-ID");
    }

    if (incomeEl) {
      incomeEl.textContent = "Rp" + data.total_income.toLocaleString("id-ID");
    }

    if (expenseEl) {
      expenseEl.textContent = "Rp" + data.total_expense.toLocaleString("id-ID");
    }
  } catch (error) {
    console.error(error);
  }
}