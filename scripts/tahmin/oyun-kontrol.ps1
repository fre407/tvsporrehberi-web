# İddialı Tahminler akşam görevi — bilgisayar şu an oyun için mi kullanılıyor?
# Kullanıcı isteği (2026-11-02): oyun oynarken görev çalışmasın, bilgisayarı
# kullanmasına engel olmasın. İki bağımsız işaret:
#   1) Windows'un "kullanıcı meşgul" durumu: tam ekran oyun (D3D), tam ekran
#      uygulama ya da sunum modu.
#   2) Ekran kartının 3D motoru ~6 saniye boyunca ortalama %35'in üstünde
#      (pencereli/kenarlıksız oyunlar 1. işareti vermez, bunu verir).
# Çıktı: "UYGUN" (çıkış kodu 0) ya da "MESGUL: <neden>" (çıkış kodu 1).

$ErrorActionPreference = 'SilentlyContinue'

Add-Type -TypeDefinition @'
using System;
using System.Runtime.InteropServices;
public static class TvsrNotifyState {
    [DllImport("shell32.dll")]
    public static extern int SHQueryUserNotificationState(out int state);
}
'@

$state = 0
[void][TvsrNotifyState]::SHQueryUserNotificationState([ref]$state)
# 2 = tam ekran uygulama, 3 = tam ekran Direct3D (oyun), 4 = sunum modu
if ($state -in 2, 3, 4) {
    Write-Output "MESGUL: tam ekran uygulama/oyun açık (durum $state)"
    exit 1
}

$samples = @()
for ($i = 0; $i -lt 3; $i++) {
    $engines = Get-CimInstance -ClassName Win32_PerfFormattedData_GPUPerformanceCounters_GPUEngine |
        Where-Object { $_.Name -like '*engtype_3D*' }
    $total = ($engines | Measure-Object -Property UtilizationPercentage -Sum).Sum
    if ($null -eq $total) { $total = 0 }
    $samples += [double]$total
    Start-Sleep -Seconds 2
}
$avg = ($samples | Measure-Object -Average).Average
if ($avg -gt 35) {
    Write-Output ("MESGUL: ekran kartı 3D kullanımı yüksek (ortalama %{0:N0})" -f $avg)
    exit 1
}

Write-Output ("UYGUN (ekran kartı 3D ortalama %{0:N0})" -f $avg)
exit 0
